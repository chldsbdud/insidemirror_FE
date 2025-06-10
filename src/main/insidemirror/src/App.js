import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

// 페이지
import LockScreen from "./pages/LockScreen";
import MainScreen from "./pages/MainScreen";
import Schedules from "./pages/Schedules";
import Settings from "./pages/Settings";
import MainPage from "./components/Main";
import CameraPage from "./components/CameraPage";
import BottomNav from "./components/BottomNav";
import Archive from "./pages/Archive";
import MainArchive from "./components/MainArchive";
//수정중_ main에서 app으로 옮기는중
import GazeTracker from "./components/GazeTracker/GazeTracker";
import GazeDot from "./components/GazeTracker/GazeDot";
import GazeRingZone from "./components/GazeTracker/GazeRingZone";
import ZoneManager from "./components/GazeTracker/ZoneManager";
import "./styles/App.css";

//BottomNav 제어
function BottomNavWrapper() {
  const location = useLocation();
  return location.pathname !== "/mobile" ? <BottomNav /> : null;
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [showSchedules, setShowSchedules] = useState(false);
  const [initialPath, setInitialPath] = useState(null);
  const [remainingTime, setRemainingTime] = useState(5);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    console.log("Gaze 좌표:", gaze);
  }, [gaze]);

  useEffect(() => {
    // 브라우저 화면 폭 기준 (768px 이하 = 모바일)
    const isMobile = window.innerWidth <= 768;
    setInitialPath(isMobile ? "/mobile" : "/main");
  }, []);

  useEffect(() => {
    // 현재 브라우저 해상도 확인
    console.log("현재 브라우저 해상도:", window.innerWidth, window.innerHeight);

    if (window.innerWidth !== 1920 || window.innerHeight !== 1080) {
      alert(
        `⚠️ 현재 브라우저 해상도는 ${window.innerWidth} x ${window.innerHeight}입니다.\n` +
          `좌표계가 1920 x 1080에 맞춰져 있다면, 실제 위치가 다를 수 있습니다.`
      );
    }
  }, []);

  if (!initialPath) return null; // 초기 경로 결정 전에는 아무 것도 렌더링하지 않음

  return (
    <Router>
      <div className="app">
        <GazeTracker onGaze={setGaze} />
        <GazeDot x={gaze.x} y={gaze.y} />
        <ZoneManager gaze={gaze} />
        <BottomNavWrapper />
        <div className="page-container">
          <AnimatedRoutes
            authenticated={authenticated}
            setAuthenticated={setAuthenticated}
            userName={userName}
            setUserName={setUserName}
            showSchedules={showSchedules}
            setShowSchedules={setShowSchedules}
            initialPath={initialPath}
          />
        </div>
      </div>
    </Router>
  );
}

function AnimatedRoutes({ authenticated, setAuthenticated, userName, setUserName, showSchedules, setShowSchedules, initialPath }) {
  const location = useLocation();
  const navigate = useNavigate();

  // 경로가 루트일 경우에만 자동 리디렉션
  useEffect(() => {
    if (location.pathname === "/") {
      navigate(initialPath, { replace: true });
    }
  }, [location.pathname, initialPath, navigate]);

  return (
    <TransitionGroup component={null}>
      <CSSTransition key={location.pathname} classNames="page-transition" timeout={300}>
        <div className="page">
          <Routes location={location}>
            <Route
              path="/mobile"
              element={
                !authenticated ? (
                  <LockScreen onAuthenticated={() => setAuthenticated(true)} onUserDetected={(name) => setUserName(name)} />
                ) : (
                  <MainScreen userName={userName} onLogout={() => setAuthenticated(false)} />
                )
              }
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/schedules" element={<Schedules />} />

            <Route path="/camera" element={<CameraPage />} />
            <Route path="/mainArchive" element={<MainArchive />}></Route>
            <Route path="*" element={<Navigate to={initialPath} />} />
          </Routes>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
}

export default App;
