import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import animationData from "../assets/MainScene.json"; // JSON 파일 경로

const MouseFollower = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.style.cursor = "none"; // 기존 커서 숨기기

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.style.cursor = "default"; // 커서 복원
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 9999,
        width: 200,
        height: 200,
      }}
    >
      <Lottie animationData={animationData} loop={true} autoplay={true} />
    </div>
  );
};

export default MouseFollower;
