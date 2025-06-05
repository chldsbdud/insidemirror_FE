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
import "./styles/App.css";

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

  if (!initialPath) return null; // 초기 경로 결정 전에는 아무 것도 렌더링하지 않음

  return (
    <Router>
      <div className="app">
        <GazeTracker onGaze={setGaze} />
        <GazeDot x={gaze.x} y={gaze.y} />
        <GazeRingZone
          gaze={gaze}
          zones={{
            weather: {
              x: 909.46,
              y: 133.85,
              width: 318.66,
              height: 213.66,
              path: "/weather",
            },
            archive: {
              x: 461,
              y: 633.33,
              width: 70,
              height: 73.33,
              path: "/archive",
            },
            home: {
              x: 605,
              y: 633.33,
              width: 70,
              height: 73.33,
              path: "/home",
            },
            camera: {
              x: 749,
              y: 633.33,
              width: 70,
              height: 73.33,
              path: "/camera",
            },
            musicPrev: {
              x: 73.44792175292969,
              y: 215.96875,
              width: 90.5,
              height: 50,
              path: "/music/prev",
            },
            musicPlayPause: {
              x: 176.73959350585938,
              y: 215.96875,
              width: 90.5,
              height: 50,
              path: "/music/play-pause",
            },
            musicNext: {
              x: 280.03125,
              y: 215.96875,
              width: 90.5,
              height: 50,
              path: "/music/next",
            },
          }}
        />
        <BottomNav />
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
