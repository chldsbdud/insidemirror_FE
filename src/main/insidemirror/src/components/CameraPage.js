import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import "../styles/CameraPage.css";
import * as faceMesh from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import HeartFilter from "../img/heartFilter.png";
import GlassesFilter from "../img/glassMando.png";
import luckeyFilter from "../img/luckey.png";
import HistoryFilter from "../img/history.png";
import SinnandaFilter from "../img/sinnanda.png";
import GanadiFilter from "../img/ganadi.png";
import CameraIcon from "../img/camera2.png";
import * as hands from "@mediapipe/hands";

function CameraPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const heartRef = useRef(null);
  const glassesRef = useRef(null);
  const ganadiRef = useRef(null);
  const luckeyRef = useRef(null);
  const historyRef = useRef(null);
  const sinnandaRef = useRef(null);
  const captureButtonRef = useRef(null);

  const [savedImages, setSavedImages] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [lastCapture, setLastCapture] = useState(0);
  const [captureTimeout, setCaptureTimeout] = useState(null);
  const [lastGestureTime, setLastGestureTime] = useState(0);
  const [countdown, setCountdown] = useState(null);

  // 필터 버튼 ref 추가
  const heartButtonRef = useRef(null);
  const glassesButtonRef = useRef(null);
  const luckeyButtonRef = useRef(null);
  const historyButtonRef = useRef(null);
  const sinnandaButtonRef = useRef(null);
  const ganadiButtonRef = useRef(null);

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
    const logRect = (name, ref) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        console.log(`${name} 버튼 좌표:`, {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    logRect("카메라", captureButtonRef);
    logRect("하트 필터", heartButtonRef);
    logRect("안경 필터", glassesButtonRef);
    logRect("가나디 필터", ganadiButtonRef);
    logRect("럭키 필터", luckeyButtonRef);
    logRect("추억 필터", historyButtonRef);
    logRect("신난다 필터", sinnandaButtonRef);
  }, []);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.drawImage(videoRef.current, 0, 0, canvasElement.width, canvasElement.height); // 반전 없음!

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

      /*카메라 좌우 반전*/
      canvasCtx.save(); // 상태 저장
      canvasCtx.translate(canvasElement.width, 0);
      canvasCtx.scale(-1, 1); // 좌우 반전 적용
      canvasCtx.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.restore(); // 상태 복구 (필수)

      const landmarks = results.multiFaceLandmarks[0];
      const forehead = landmarks[10];
      const jaw = landmarks[152];

      //하트 이모지
      if (selectedFilter === "heart" && heartRef.current?.complete) {
        const imageWidth = 200;
        const imageHeight = 120;
        // 좌우 반전 적용
        canvasCtx.save(); // 상태 저장
        canvasCtx.translate(canvasElement.width, 0);
        canvasCtx.scale(-1, 1); // 좌우 반전 적용
        const x = forehead.x * canvasElement.width - imageWidth / 2;
        const y = forehead.y * canvasElement.height - imageHeight * 1.5;
        canvasCtx.drawImage(heartRef.current, x, y, imageWidth, imageHeight);
        canvasCtx.restore(); // 상태 복구
      }

      //안경 만두
      if (selectedFilter === "glasses" && glassesRef.current?.complete) {
        const imageWidth = 200;
        const imageHeight = 200;
        // 턱 끝 기준, y는 어깨 근처로 내리고 x는 왼쪽으로 10% 이동
        const x = jaw.x * canvasElement.width - imageWidth / 2 - imageWidth * 0.9;
        const y = jaw.y * canvasElement.height - imageHeight / 2 + canvasElement.height * 0.12;
        canvasCtx.drawImage(glassesRef.current, x, y, imageWidth, imageHeight);
      }
      //가나디
      if (selectedFilter === "ganadi" && ganadiRef.current?.complete) {
        const imageWidth = 250;
        const imageHeight = 250;
        const x = (canvasElement.width - imageWidth) / 8;
        const y = canvasElement.height - imageHeight;
        canvasCtx.drawImage(ganadiRef.current, x, y, imageWidth, imageHeight);
      }

      //럭키한 하루
      if (selectedFilter === "luckey" && luckeyRef.current?.complete) {
        const imageWidth = 200;
        const imageHeight = 150;
        const x = (canvasElement.width - imageWidth) / 2; // 화면 중앙에 위치시킴
        const y = canvasElement.height - imageHeight - 10; // 화면 아래쪽에 고정 (20px 위로)
        canvasCtx.drawImage(luckeyRef.current, x, y, imageWidth, imageHeight);
      }

      //추억쌓기
      if (selectedFilter === "history" && luckeyRef.current?.complete) {
        const imageWidth = 200;
        const imageHeight = 120;
        const x = (canvasElement.width - imageWidth) / 6;
        const y = canvasElement.height - imageHeight - 20;
        canvasCtx.drawImage(historyRef.current, x, y, imageWidth, imageHeight);
      }

      //신난다
      if (selectedFilter === "sinnanda" && luckeyRef.current?.complete) {
        const imageWidth = 300;
        const imageHeight = 120;
        const x = (canvasElement.width - imageWidth) / 2;
        const y = canvasElement.height - imageHeight - 20;
        canvasCtx.drawImage(sinnandaRef.current, x, y, imageWidth, imageHeight);
      }
    });

    if (videoRef.current) {
      const cam = new Camera(videoRef.current, {
        onFrame: async () => {
          const frame = videoRef.current;
          await faceMeshInstance.send({ image: frame });
          await handDetector.send({ image: frame }); // 손도 동시에 분석
        },
        width: 640,
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

  // 손 모듈 초기화
  const handDetector = new hands.Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });
  handDetector.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });

  // 손 인식 결과 처리
  handDetector.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      const thumb = landmarks[4];
      const pinky = landmarks[20];

      const dx = thumb.x - pinky.x;
      const dy = thumb.y - pinky.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const now = Date.now();

      if (distance > 0.3 && now - lastGestureTime > 5000) {
        if (!captureTimeout) {
          console.log("손바닥 감지됨 - 카운트다운 시작");

          let count = 3;
          setCountdown(count);

          const intervalId = setInterval(() => {
            count -= 1;
            if (count === 0) {
              clearInterval(intervalId);
              setCountdown(null);
              handleSaveImage();
              setLastGestureTime(Date.now());
            } else {
              setCountdown(count);
            }
          }, 1000);

          setCaptureTimeout(intervalId); // 재사용 방지
        }
      }
    }
  });

  useEffect(() => {
    return () => {
      if (captureTimeout) clearInterval(captureTimeout);
    };
  }, [captureTimeout]);

  const shouldCapture = () => {
    const now = Date.now();
    if (now - lastCapture > 2000) {
      // 최소 2초 간격
      setLastCapture(now);
      return true;
    }
    return false;
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

        <div className="camera-container">
          <video ref={videoRef} style={{ display: "none", transform: "scaleX(1)" }} />
          <canvas ref={canvasRef} className="face-canvas" />
          {countdown !== null && <div className="countdown-overlay">{countdown}</div>}

          {/* 필터 버튼들 */}
          <div className="filter-buttons">
            <div className="left">
              <button onClick={() => setSelectedFilter("heart")} ref={heartButtonRef}>
                <img src={HeartFilter} />
              </button>
              <button onClick={() => setSelectedFilter("glasses")} ref={glassesButtonRef}>
                <img src={GlassesFilter} />
              </button>
              <button onClick={() => setSelectedFilter("ganadi")} ref={ganadiButtonRef}>
                <img src={GanadiFilter} />
              </button>
            </div>

            <div className="right">
              <button onClick={() => setSelectedFilter("luckey")} ref={luckeyButtonRef}>
                <img src={luckeyFilter} />
              </button>
              <button onClick={() => setSelectedFilter("history")} ref={historyButtonRef}>
                <img src={HistoryFilter} />
              </button>
              <button onClick={() => setSelectedFilter("sinnanda")} ref={sinnandaButtonRef}>
                <img src={SinnandaFilter} />
              </button>
            </div>
          </div>
        </div>

        {/* 카메라 촬영 버튼 */}
        <div className="camera-button">
          <button className="camera-box" onClick={handleSaveImage} title="사진 저장" ref={captureButtonRef}>
            <img src={CameraIcon} alt="카메라 아이콘" />
          </button>
        </div>
        {/* 필터 이미지들 */}
        <img ref={heartRef} src={HeartFilter} alt="Heart Filter" style={{ display: "none" }} />
        <img ref={glassesRef} src={GlassesFilter} alt="Glasses Filter" style={{ display: "none" }} />
        <img ref={luckeyRef} src={luckeyFilter} alt="luckey Filter" style={{ display: "none" }} />
        <img ref={historyRef} src={HistoryFilter} alt="history Filter" style={{ display: "none" }} />
        <img ref={sinnandaRef} src={SinnandaFilter} alt="sinanada Filter" style={{ display: "none" }} />
        <img ref={ganadiRef} src={GanadiFilter} alt="ganadi Filter" style={{ display: "none" }} />

        {/* 필터 선택 버튼 */}
        {/* <div className="filter-buttons">
          <div className="left">
            <button onClick={() => setSelectedFilter("heart")} ref={heartButtonRef}>
              <img src={HeartFilter} />
            </button>
            <button onClick={() => setSelectedFilter("glasses")} ref={glassesButtonRef}>
              <img src={GlassesFilter} />
            </button>
          </div>

          <div className="right">
            <button onClick={() => setSelectedFilter("luckey")} ref={luckeyButtonRef}>
              <img src={luckeyFilter} />
            </button>
            <button onClick={() => setSelectedFilter("history")} ref={historyButtonRef}>
              <img src={HistoryFilter} />
            </button>
            <button onClick={() => setSelectedFilter("sinnanda")} ref={sinnandaButtonRef}>
              <img src={SinnandaFilter} />
            </button>
          </div>
        </div> */}
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
