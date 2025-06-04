// components/TopNav.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/BottomNav.css";
import home from "../img/home.png";
import camera from "../img/camera.png";
import archive from "../img/archive.png";

function BottomNav({ currentName }) {
  const navigate = useNavigate();

  return (
    <div className="top-nav">
      <button className="text-button" onClick={() => navigate("/mainArchive")}>
        <img src={archive} alt="archive" />
      </button>
      <button className="text-button" onClick={() => navigate("/")}>
        <img src={home} alt="home" />
      </button>
      <button
        className="text-button"
        onClick={
          () => navigate("/Camera", { state: { userName: currentName } }) // userName 함께 전달
        }
      >
        <img src={camera} alt="camera" />
      </button>
    </div>
  );
}

export default BottomNav;
