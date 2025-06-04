import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";
import "./SchedulesMobile.css";
import backBtn from "../img/backBtn.png";
function Settings() {
  const navigate = useNavigate();

  const [weatherEnabled, setWeatherEnabled] = useState(true);
  const [trafficEnabled, setTrafficEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [newsEnabled, setNewsEnabled] = useState(true);

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-button" onClick={() => navigate("/setting")}>
          <img src={backBtn}></img>
        </button>
        <h2>사용자 지정 메뉴</h2>
      </div>
      <hr></hr>

      <div className="setting-item">
        <span>날씨 정보</span>
        <label className="switch">
          <input type="checkbox" checked={weatherEnabled} onChange={() => setWeatherEnabled(!weatherEnabled)} />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="setting-item">
        <span>교통 정보</span>
        <label className="switch">
          <input type="checkbox" checked={trafficEnabled} onChange={() => setTrafficEnabled(!trafficEnabled)} />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="setting-item">
        <span>음악 플레이리스트</span>
        <label className="switch">
          <input type="checkbox" checked={musicEnabled} onChange={() => setMusicEnabled(!musicEnabled)} />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="setting-item">
        <span>뉴스 헤더</span>
        <label className="switch">
          <input type="checkbox" checked={newsEnabled} onChange={() => setNewsEnabled(!newsEnabled)} />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
}

export default Settings;
