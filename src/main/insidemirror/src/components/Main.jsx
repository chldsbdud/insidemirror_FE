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

//메인 함수 시작
function Main() {
  // 새로고침 시 사용자 이름 초기화
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

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing the camera:", error);
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
          localStorage.setItem("userName", data.currentName); //로컬스토리지에 저장
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
          {/* <h2 className="userName">Hello, {currentName} !</h2> */}
          <div className="time-weather">
            <div className="time">{time}</div>
            <div className="date">{date}</div>
            {/* <Hello /> */}
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
