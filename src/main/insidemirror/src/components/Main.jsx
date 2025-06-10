import React, { useRef, useEffect, useState } from "react";
import "../styles/App.css";
import Hello from "./Hello";
import NewsTicker from "./NewsTicker";
import BusInfo from "./BusInfo";
import Schedule from "./Schedule";
import FaceAnimation from "./FaceAnimation";
import WeatherWidget from "./WeatherWidget";
import MusicPlayer from "./MusicPlayer";
import MouseFollower from "./MouseFollower";
import Chatbot from "./Chatbot";

// ABKO 웹캠 찾는 함수
async function findABKOCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === "videoinput");
    return videoDevices.find((device) => device.label.includes("ABKO APC720 HD WEBCAM"));
  } catch (error) {
    console.error("장치 검색 오류:", error);
    return null;
  }
}

function Main() {
  // 기존 코드 유지
  useEffect(() => {
    localStorage.removeItem("userName");
  }, []);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [currentName, setCurrentName] = useState("Unknown");
  const [remainingTime, setRemainingTime] = useState(5);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!localStorage.getItem("client_id")) {
      const timestamp = Date.now();
      const newClientId = `client_${timestamp}`;
      localStorage.setItem("client_id", newClientId);
      console.log("Generated new client ID:", newClientId);
    }
  }, []);

  useEffect(() => {
    if (currentName !== "Unknown") {
      speak(`안녕하세요, ${currentName} 님`);
    }
  }, [currentName]);

  // 카메라 시작 로직 수정 부분
  useEffect(() => {
    const startCamera = async () => {
      try {
        // ABKO 카메라 찾기
        const abkoCamera = await findABKOCamera();

        // 카메라 설정
        const constraints = {
          video: {
            deviceId: abkoCamera
              ? { exact: abkoCamera.deviceId } // ABKO 있으면 지정
              : true, // 없으면 기본 카메라
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("카메라 접근 오류:", error);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // 나머지 기존 코드 모두 유지
  useEffect(() => {
    const intervalId = setInterval(captureAndSendFrame, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${minutes}`);

      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      const formattedDate = now.toLocaleDateString("ko-KR", options).replace(",", "");
      const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });
      setDate(`${formattedDate} ${dayOfWeek}`);
    };

    updateTimeAndDate();
    const intervalId = setInterval(updateTimeAndDate, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const captureAndSendFrame = async () => {
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

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        if (data.currentName) {
          setCurrentName(data.currentName);
          localStorage.setItem("userName", data.currentName);
          setRemainingTime(data.remainingTime);
        } else {
          setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
        }
      } catch (error) {
        console.error("Error sending frame:", error);
      }
    }, "image/jpeg");
  };

  return (
    <div className="app">
      <MouseFollower />

      <div className="bottom-section">
        <div className="left-section">
          <div className="time-weather">
            <div className="time">{time}</div>
            <div className="date">{date}</div>
            <MusicPlayer />
            <Schedule name={currentName} />
          </div>
        </div>
        <div className="middle-section">
          <FaceAnimation />
          <video ref={videoRef} autoPlay muted style={{ width: "0%" }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <Chatbot />
        </div>

        <div className="right-section">
          <WeatherWidget />
          <NewsTicker />
          <BusInfo />

          <div id={`youtube-player-PL4fGSI1pDJn5S09aId3dUGp40ygUqmPGc`} style={{ display: "none" }} />
        </div>
      </div>
    </div>
  );
}

export default Main;
