import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/CameraPage.css";
import * as faceMesh from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import FrameIcon from "../img/heartFilter.png";
import CameraIcon from "../img/camera2.png";
function CameraPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameImgRef = useRef(null);
  const [savedImages, setSavedImages] = useState([]);

  //절대경로
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  //카메라 가상 배경 및 얼굴 디텍트
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

      // 배경 그리기
      canvasCtx.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

      // 얼굴 랜드마크 사용: 10번은 이마 중앙 부근
      const landmarks = results.multiFaceLandmarks[0];
      const forehead = landmarks[10];

      if (frameImgRef.current && frameImgRef.current.complete) {
        const imageWidth = 200;
        const imageHeight = 100;
        const x = forehead.x * canvasElement.width - imageWidth / 2;
        const y = forehead.y * canvasElement.height - imageHeight * 1.5; // 약간 위로 올림

        canvasCtx.drawImage(frameImgRef.current, x, y, imageWidth, imageHeight);
      }
    });

    if (typeof videoRef.current !== "undefined" && videoRef.current !== null) {
      const cam = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMeshInstance.send({ image: videoRef.current });
        },
        width: 620,
        height: 480,
      });
      cam.start();
    }
  }, []);

  //저장된 이미지 담기
  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");

    // 이미지 미리보기 저장
    setSavedImages((prev) => [dataURL, ...prev]);

    // Blob 변환 → File 생성 → 업로드
    const blob = dataURLtoBlob(dataURL);
    const file = new File([blob], `photo_${Date.now()}.png`, { type: "image/png" });

    uploadImage(file); // 업로드 실행
  };

  // 날짜 생성 함수
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10); // "2025-06-04" 형식
  };

  //이름 가져오기
  const userName = localStorage.getItem("userName") || "Unknown";
  useEffect(() => {
    if (userName && userName !== "Unknown") {
      const today = getTodayString();
      fetchImages(userName, today);
    }
  }, []);

  //이미지 저장 api
  const uploadImage = async (file) => {
    if (!userName || userName === "Unknown") {
      console.warn("사용자 이름이 없습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("name", userName); // 받은 이름
    formData.append("date", getTodayString()); // 오늘 날짜
    formData.append("file", file); // 이미지

    try {
      const response = await axios.post(`${API_BASE}/api/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("업로드 성공:", response.data);
    } catch (error) {
      if (error.response) {
        console.error("서버 오류:", error.response.data.message);
      } else {
        console.error("요청 실패:", error.message);
      }
    }
  };

  //이미지 조회
  const fetchImages = async (name, date) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/images`, {
        params: { name, date },
      });

      const images = response.data;
      console.log("받은 이미지 목록:", images);
      // 서버에서 받은 imagePath들을 src URL로 변환
      const serverImageSrcs = images.map((img) => `${process.env.REACT_APP_API_BASE_URL}${img.imagePath}`);

      // 기존 저장된 이미지 + 서버 이미지 합치기
      setSavedImages((prev) => [...serverImageSrcs, ...prev]);
    } catch (error) {
      console.error("이미지 조회 실패:", error);
    }
  };

  // base64 → Blob 변환 유틸 함수
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

        <img ref={frameImgRef} src={FrameIcon} alt="heartFilter" style={{ display: "none", width: "600px" }} />

        {/* 카메라 촬영 버튼 */}
        <div className="camera-button">
          <button className="camera-box" onClick={handleSaveImage} title="사진 저장">
            <img src={CameraIcon} alt="카메라 아이콘" />
          </button>
        </div>
      </div>
      {/* 저장된 사진 슬라이드 영역 */}
      <div className="saved-images-slide">
        {savedImages.map((imgSrc, idx) => (
          <img
            key={idx}
            src={imgSrc}
            alt={`저장된 사진 ${idx + 1}`}
            onClick={() => window.open(imgSrc, "_blank")} // 클릭 시 새 창에서 보기
          />
        ))}
      </div>
    </>
  );
}

export default CameraPage;
