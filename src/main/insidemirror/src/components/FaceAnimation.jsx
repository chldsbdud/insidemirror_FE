import React from "react";
import Lottie from "lottie-react";
import faceAnimation from "../assets/Animation-IM-haha.json";
import "../styles/FaceAnimation.css";
import imGif from "../assets/im.gif";
function FaceAnimation() {
  return (
    <div className="container">
      {/* <Lottie animationData={faceAnimation} loop autoplay style={{ width: "100px", height: "100px", display: "flex", margin: "auto 0" }} /> */}
      <img src={imGif} loop autoplay style={{ width: "100px", height: "100px", display: "flex", margin: "auto 0" }} />
    </div>
  );
}

export default FaceAnimation;
