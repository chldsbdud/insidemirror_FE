import React, { useEffect, useRef, useState } from "react";
import "./LockScreen.css";
import imLogo from "../img/imLogo.png";
import FaceAnimation from "../components/FaceAnimation";

function LockScreen({ onAuthenticated, onUserDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentName, setCurrentName] = useState("Guest");

  useEffect(() => {
    if (!localStorage.getItem("client_id")) {
      const newClientId = `client_${Date.now()}`;
      localStorage.setItem("client_id", newClientId);
    }
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("카메라 접근 오류:", error);
      }
    };

    startCamera();
    const intervalId = setInterval(captureAndSendFrame, 1000);

    return () => {
      clearInterval(intervalId);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureAndSendFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");
      formData.append("client_id", localStorage.getItem("client_id"));

      try {
        const response = await fetch("https://number5.store/recognize", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`);

        const data = await response.json();
        console.log("서버 응답:", data); // 확인용

        if (data.currentName && data.currentName !== "Unknown") {
          setCurrentName(data.currentName);
          onUserDetected(data.currentName);
          onAuthenticated(); // 이름 인식되면 바로 전환
        }
      } catch (error) {
        console.error("프레임 전송 오류:", error);
      }
    }, "image/jpeg");
  };

  return (
    <div className="lockscreen">
      <img src={imLogo} alt="Logo" className="lockscreen-logo" />
      <h2>얼굴 인식을 통한 로그인 중입니다...</h2>
      <FaceAnimation />
      <h1>{currentName !== "Unknown" ? `Hello, ${currentName}` : "사용자를 인식하지 못했습니다"}</h1>
      <video ref={videoRef} autoPlay muted style={{ width: "0%" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default LockScreen;
