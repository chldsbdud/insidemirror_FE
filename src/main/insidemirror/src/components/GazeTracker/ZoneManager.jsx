// src/components/ZoneManager.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import GazeRingZone from "./GazeRingZone";

// 각 페이지별로 활성화할 zone 정보
const pageZones = {
  main: {
    home: {
      x: 605,
      y: 618,
      width: 70,
      height: 73.33,
      path: "/home",
    },
    camera: {
      x: 749,
      y: 618,
      width: 70,
      height: 73.33,
      path: "/camera",
    },
    archive: {
      x: 461,
      y: 618,
      width: 70,
      height: 73.33,
      path: "/archive",
    },
    weather: {
      x: 901.8,
      y: 133.85,
      width: 318.66,
      height: 213.66,
      path: "/weather",
    },
    musicPrev: {
      x: 65.78,
      y: 220.96,
      width: 90.5,
      height: 50,
      path: "/music/prev",
    },
    musicPlayPause: {
      x: 169.07,
      y: 220.96,
      width: 90.5,
      height: 50,
      path: "/music/play-pause",
    },
    musicNext: {
      x: 272.36,
      y: 220.96,
      width: 90.5,
      height: 50,
      path: "/music/next",
    },
  },
  camera: {
    home: {
      x: 605,
      y: 618,
      width: 70,
      height: 73.33,
      path: "/home",
    },
    camera: {
      x: 749,
      y: 618,
      width: 70,
      height: 73.33,
      path: "/camera",
    },
    archive: {
      x: 461,
      y: 618,
      width: 70,
      height: 73.33,
      path: "/archive",
    },
    heartBg: {
      x: 442.33,
      y: 473.04,
      width: 60,
      height: 65.98,
      path: "/bg/heart",
    },
    dumplingBg: {
      x: 522.33,
      y: 473.04,
      width: 60,
      height: 65.98,
      path: "/bg/dumpling",
    },
    luckyBg: {
      x: 602.33,
      y: 473.04,
      width: 60,
      height: 65.98,
      path: "/bg/lucky",
    },
    memoBg: {
      x: 682.33,
      y: 473.04,
      width: 60,
      height: 65.98,
      path: "/bg/memo",
    },
    funBg: {
      x: 762.33,
      y: 473.04,
      width: 60,
      height: 65.98,
      path: "/bg/fun",
    },
    // 필요하다면 camera에서만 활성화할 다른 zone도 추가
  },
  archive: {
    home: {
      x: 605,
      y: 618,
      width: 70,
      height: 73.33,
      path: "/home",
    },
    camera: {
      x: 749,
      y: 618,
      width: 70,
      height: 73.33,
      path: "/camera",
    },
    archive: {
      x: 461,
      y: 618,
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
