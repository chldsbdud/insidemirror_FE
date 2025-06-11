import React from "react";
import Lottie from "lottie-react";
import faceAnimation from "../assets/Animation-IM-haha.json"; // 경로 확인 필요
import "../styles/FaceAnimation.css";

function FaceAnimation() {
  return (
    <div className="container">
      <Lottie animationData={faceAnimation} loop autoplay style={{ width: "100px", height: "100px", display: "flex", margin: "auto 0" }} />
    </div>
  );
}

export default FaceAnimation;
