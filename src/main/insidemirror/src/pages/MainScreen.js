import React from "react";
import "./MainScreen.css";
import { useNavigate } from "react-router-dom"; // 추가
import calendarIcon from "../img/calendar.png";
import personIcon from "../img/person.png";
import logoutIcon from "../img/logout.png";
import folderIcon from "../img/folder.png";

function MainScreen({ userName, onLogout, onGoToSchedules }) {
  const navigate = useNavigate(); // 라우터 훅

  const handleOpenSettings = () => {
    navigate("/mobile/settings"); // Settings 페이지로 이동
  };

  const handleOpenSchedules = () => {
    navigate("/mobile/schedules", { state: { userName } });
  };

  const handleOpenArchive = () => {
    navigate("/mainArchive");
  };
  return (
    <div className="main-screen">
      <h1 className="greeting">안녕하세요, {userName}님!</h1>

      <div className="button-group">
        <div className="circle-button" onClick={handleOpenSchedules}>
          <img src={calendarIcon} alt="일정 관리" />
          <p>일정 관리</p>
        </div>
        <div className="circle-button" onClick={handleOpenSettings}>
          <img src={personIcon} alt="메뉴 변경" />
          <p>메뉴 변경</p>
        </div>
        <div className="circle-button" onClick={handleOpenArchive}>
          <img src={folderIcon} alt="아카이빙 관리" />
          <p>아카이빙 관리</p>
        </div>
      </div>

      <button className="logout-button" onClick={onLogout}>
        <img src={logoutIcon} alt="로그아웃" />
      </button>
    </div>
  );
}

export default MainScreen;
