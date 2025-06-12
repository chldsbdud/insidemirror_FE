// src/components/ZoneManager.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import GazeRingZone from "./GazeRingZone";

// 각 페이지별로 활성화할 zone 정보
const pageZones = {
  main: {
    home: {
      x: 605,
      y: 633.3333,
      width: 70,
      height: 73.33,
      path: "/home",
    },
    camera: {
      x: 749,
      y: 633.3333,
      width: 70,
      height: 73.33,
      path: "/camera",
    },
    archive: {
      x: 461,
      y: 633.3333,
      width: 70,
      height: 73.33,
      path: "/archive",
    },
    weather: {
      x: 909.46,
      y: 133.85,
      width: 318.66,
      height: 213.66,
      path: "/weather",
    },
    musicPrev: {
      x: 73.44,
      y: 220.96,
      width: 90.5,
      height: 50,
      path: "/music/prev",
    },
    musicPlayPause: {
      x: 176.73,
      y: 220.96,
      width: 90.5,
      height: 50,
      path: "/music/play-pause",
    },
    musicNext: {
      x: 280.03,
      y: 220.96,
      width: 90.5,
      height: 50,
      path: "/music/next",
    },
  },
  camera: {
    home: {
      x: 605,
      y: 633.3333,
      width: 70,
      height: 73.33,
      path: "/home",
    },
    camera: {
      x: 749,
      y: 633.3333,
      width: 70,
      height: 73.33,
      path: "/camera",
    },
    archive: {
      x: 461,
      y: 633.3333,
      width: 70,
      height: 73.33,
      path: "/archive",
    },
    heartBg: {
      x: 179.5,
      y: 121.677,
      width: 100,
      height: 100,
      path: "/bg/heart",
    },
    dumplingBg: {
      x: 179.5,
      y: 241.677,
      width: 100,
      height: 100,
      path: "/bg/dumpling",
    },
    ganadiBg: {
      x: 179.5,
      y: 361.677,
      width: 100,
      height: 100,
      path: "/bg/ganadi",
    },
    luckyBg: {
      x: 1000.5,
      y: 121.677,
      width: 100,
      height: 100,
      path: "/bg/lucky",
    },
    memoBg: {
      x: 1000.5,
      y: 241.677,
      width: 100,
      height: 100,
      path: "/bg/memo",
    },
    funBg: {
      x: 1000.5,
      y: 361.677,
      width: 100,
      height: 100,
      path: "/bg/fun",
    },
    // 필요하다면 camera에서만 활성화할 다른 zone도 추가
  },
  archive: {
    home: {
      x: 605,
      y: 633.3333,
      width: 70,
      height: 73.33,
      path: "/home",
    },
    camera: {
      x: 749,
      y: 633.3333,
      width: 70,
      height: 73.33,
      path: "/camera",
    },
    archive: {
      x: 461,
      y: 633.3333,
      width: 70,
      height: 73.33,
      path: "/archive",
    },
    pdfPrev: {
      x: 531.88,
      y: 564.97,
      width: 80,
      height: 23.33,
      path: "/pdf/prev",
    },
    pdfNext: {
      x: 652.79,
      y: 564.97,
      width: 80,
      height: 23.33,
      path: "/pdf/next",
    },
    // 필요하다면 archive에서만 활성화할 다른 zone도 추가
  },
  // 필요하면 다른 페이지도 추가
};

const ZoneManager = ({ gaze }) => {
  const location = useLocation();

  // 경로에 맞는 zone만 골라서 반환
  const getCurrentZones = () => {
    if (location.pathname === "/main") return pageZones.main;
    if (location.pathname === "/Camera") return pageZones.camera;
    if (location.pathname === "/mainArchive") return pageZones.archive;
    // 다른 경로에서는 빈 객체
    return {};
  };

  const currentZones = getCurrentZones();

  // zone이 없으면 렌더링하지 않음
  if (Object.keys(currentZones).length === 0) return null;

  return <GazeRingZone gaze={gaze} zones={currentZones} />;
};

export default ZoneManager;
