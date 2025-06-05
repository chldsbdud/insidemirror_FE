import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/BottomNav.css";
import home from "../img/home.png";
import camera from "../img/camera.png";
import archive from "../img/archive.png";

function BottomNav({ currentName }) {
  const navigate = useNavigate();

  // 버튼 각각에 ref 연결
  const archiveRef = useRef(null);
  const homeRef = useRef(null);
  const cameraRef = useRef(null);

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

    logRect("archive", archiveRef);
    logRect("home", homeRef);
    logRect("camera", cameraRef);
  }, []);

  return (
    <div className="top-nav">
      <button className="text-button" ref={archiveRef} onClick={() => navigate("/mainArchive")}>
        <img src={archive} alt="archive" />
      </button>

      <button className="text-button" ref={homeRef} onClick={() => navigate("/")}>
        <img src={home} alt="home" />
      </button>

      <button className="text-button" ref={cameraRef} onClick={() => navigate("/Camera", { state: { userName: currentName } })}>
        <img src={camera} alt="camera" />
      </button>
    </div>
  );
}

export default BottomNav;
