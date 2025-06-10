// src/components/ZoneManager.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import GazeRingZone from "./GazeRingZone";

// 각 페이지별로 활성화할 zone 정보
const pageZones = {
  main: {
    weather: {
      x: 909.46,
      y: 133.85,
      width: 318.66,
      height: 213.66,
      path: "/weather",
    },
    camera: {
      x: 749,
      y: 633.33,
      width: 70,
      height: 73.33,
      path: "/camera",
    },
    archive: {
      x: 461,
      y: 633.33,
      width: 70,
      height: 73.33,
      path: "/archive",
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

    // 필요하다면 main에서만 활성화할 다른 zone도 추가
  },
  camera: {
    // 필요하다면 camera에서만 활성화할 다른 zone도 추가
  },
  archive: {
    // 필요하다면 archive에서만 활성화할 다른 zone도 추가
  },
  // 필요하면 다른 페이지도 추가
};

const ZoneManager = ({ gaze }) => {
  const location = useLocation();

  // 경로에 맞는 zone만 골라서 반환
  const getCurrentZones = () => {
    if (location.pathname === "/main") return pageZones.main;
    if (location.pathname === "/camera") return pageZones.camera;
    if (location.pathname === "/archive") return pageZones.archive;
    // 다른 경로에서는 빈 객체
    return {};
  };

  const currentZones = getCurrentZones();

  // zone이 없으면 렌더링하지 않음
  if (Object.keys(currentZones).length === 0) return null;

  return <GazeRingZone gaze={gaze} zones={currentZones} />;
};

export default ZoneManager;
