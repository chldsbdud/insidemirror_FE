import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/CameraPage.css";
import * as faceMesh from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import HeartFilter from "../img/heartFilter.png";
import GlassesFilter from "../img/glassMando.png";
import CameraIcon from "../img/camera2.png";

function CameraPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const heartRef = useRef(null);
  const glassesRef = useRef(null);
  const captureButtonRef = useRef(null);

  const [savedImages, setSavedImages] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("heart");

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (captureButtonRef.current) {
      const rect = captureButtonRef.current.getBoundingClientRect();
      console.log("카메라 버튼 좌표:", {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    const faceMeshInstance = new faceMesh.FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMeshInstance.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMeshInstance.onResults((results) => {
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;

      const video = videoRef.current;
      canvasElement.width = video.videoWidth;
      canvasElement.height = video.videoHeight;
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

      const landmarks = results.multiFaceLandmarks[0];
      const forehead = landmarks[10];
      const eyeCenter = landmarks[234]; // 눈 중심 근처

      if (selectedFilter === "heart" && heartRef.current?.complete) {
        const imageWidth = 200;
        const imageHeight = 120;
        const x = forehead.x * canvasElement.width - imageWidth / 2;
        const y = forehead.y * canvasElement.height - imageHeight * 1.5;
        canvasCtx.drawImage(heartRef.current, x, y, imageWidth, imageHeight);
      }

      if (selectedFilter === "glasses" && glassesRef.current?.complete) {
        const imageWidth = 100;
        const imageHeight = 100;
        const x = eyeCenter.x * canvasElement.width - imageWidth / 2;
        const y = eyeCenter.y * canvasElement.height - imageHeight / 2;
        canvasCtx.drawImage(glassesRef.current, x, y, imageWidth, imageHeight);
      }
    });

    if (videoRef.current) {
      const cam = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMeshInstance.send({ image: videoRef.current });
        },
        width: 620,
        height: 480,
      });
      cam.start();
    }
  }, [selectedFilter]);

  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL("image/png");
    setSavedImages((prev) => [dataURL, ...prev]);

    const blob = dataURLtoBlob(dataURL);
    const file = new File([blob], `photo_${Date.now()}.png`, { type: "image/png" });

    uploadImage(file);
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  const userName = localStorage.getItem("userName") || "Unknown";

  useEffect(() => {
    if (userName && userName !== "Unknown") {
      const today = getTodayString();
      fetchImages(userName, today);
    }
  }, []);

  const uploadImage = async (file) => {
    if (!userName || userName === "Unknown") {
      console.warn("사용자 이름이 없습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("name", userName);
    formData.append("date", getTodayString());
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_BASE}/api/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("업로드 성공:", response.data);
    } catch (error) {
      console.error("업로드 실패:", error.response?.data?.message || error.message);
    }
  };

  const fetchImages = async (name, date) => {
    try {
      const response = await axios.get(`${API_BASE}/api/images`, {
        params: { name, date },
      });
      const images = response.data;
      const srcs = images.map((img) => `${API_BASE}${img.imagePath}`);
      setSavedImages((prev) => [...srcs, ...prev]);
    } catch (error) {
      console.error("이미지 조회 실패:", error);
    }
  };

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  return (
    <>
      <div className="camera">
        <div className="photoBoothTop">
          <div className="iconBox">
            <button className="icon" style={{ background: "#FF5F57" }}></button>
            <button className="icon" style={{ background: "#FFBD2E" }}></button>
            <button className="icon" style={{ background: "#28C840" }}></button>
          </div>
          <p>PhotoBooth</p>
        </div>

        <video ref={videoRef} style={{ display: "none" }} />
        <canvas ref={canvasRef} className="face-canvas" />

        {/* 필터 이미지들 */}
        <img ref={heartRef} src={HeartFilter} alt="Heart Filter" style={{ display: "none" }} />
        <img ref={glassesRef} src={GlassesFilter} alt="Glasses Filter" style={{ display: "none" }} />

        {/* 카메라 촬영 버튼 */}
        <div className="camera-button">
          <button className="camera-box" onClick={handleSaveImage} title="사진 저장" ref={captureButtonRef}>
            <img src={CameraIcon} alt="카메라 아이콘" />
          </button>
        </div>

        {/* 필터 선택 버튼 */}
        <div className="filter-buttons">
          <button onClick={() => setSelectedFilter("heart")}>❤️ 하트</button>
          <button onClick={() => setSelectedFilter("glasses")}>🕶️ 안경만두</button>
        </div>
      </div>

      <div className="saved-images-slide">
        {savedImages.map((imgSrc, idx) => (
          <img key={idx} src={imgSrc} alt={`저장된 사진 ${idx + 1}`} onClick={() => window.open(imgSrc, "_blank")} />
        ))}
      </div>
    </>
  );
}

export default CameraPage;
