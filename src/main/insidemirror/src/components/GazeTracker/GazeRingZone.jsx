import React, { useState, useEffect, useRef } from "react";
import "../../styles/GazeRingZone.css";
import { useNavigate } from "react-router-dom";

function GazeRingZone({ gaze, zones }) {
  const [progress, setProgress] = useState(0);
  const [currentZone, setCurrentZone] = useState(null);
  const progressRef = useRef(0);
  const zoneRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("📍 gaze 입력값:", gaze);

    let activeKey = null;

    for (const [key, { x, y, width, height }] of Object.entries(zones)) {
      const inside = gaze.x >= x && gaze.x <= x + width && gaze.y >= y && gaze.y <= y + height;

      if (inside) {
        activeKey = key;
        console.log(`🎯 gaze가 ${key} zone 안에 있음`);
        break;
      }
    }

    const zoneChanged = activeKey !== zoneRef.current;

    // 🔁 zone이 바뀌었으면 초기화
    if (zoneChanged) {
      console.log("🔁 zone 변경 감지 → 초기화 수행");
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = null;
      progressRef.current = 0;
      setProgress(0);
      zoneRef.current = activeKey;
      setCurrentZone(activeKey); // 이거 놓치지 말 것
    }

    // ⏱ 타이머 조건 확인 및 시작
    if (activeKey && timerRef.current === null) {
      console.log("⏱ 타이머 시작");

      timerRef.current = setInterval(() => {
        progressRef.current += 1.67;
        setProgress(progressRef.current);
        console.log("진행률:", progressRef.current);

        if (progressRef.current >= 100) {
          console.log("조건 충족 → 이동 실행", zones[activeKey].path);
          clearInterval(timerRef.current);
          timerRef.current = null;
          progressRef.current = 0;
          setProgress(0);

          const { x, y, width, height } = zones[activeKey];
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          const targetElement = document.elementFromPoint(centerX, centerY);

          if (targetElement) {
            console.log("🖱️ DOM 클릭 시도 →", targetElement);
            targetElement.click();
          } else {
            console.warn("⚠️ 클릭할 요소를 찾을 수 없습니다.");
          }
        }
      }, 50);
    }

    // gaze가 zone 밖일 경우
    if (!activeKey && zoneRef.current !== null) {
      console.log("zone 벗어남 → 초기화");
      clearInterval(timerRef.current);
      timerRef.current = null;
      progressRef.current = 0;
      setProgress(0);
      setCurrentZone(null);
      zoneRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gaze, zones]);

  if (!currentZone) {
    console.log("📭 currentZone 없음 → 게이지 비표시");
    return null;
  }

  const { x, y, width, height } = zones[currentZone];

  // 게이지를 해당 zone의 중심으로 이동
  const gaugeSize = 60;
  const gaugeX = x + width / 2 - gaugeSize / 2;
  const gaugeY = y + height / 2 - gaugeSize / 2;

  console.log(`📍 gauge 렌더링 좌표: (${gaugeX}, ${gaugeY})`);

  return (
    <>
      {/* 하이라이트 박스 */}
      {currentZone && (
        <div
          className="zone-highlight"
          style={{
            left: zones[currentZone].x,
            top: zones[currentZone].y,
            width: zones[currentZone].width,
            height: zones[currentZone].height,
          }}
        />
      )}
      <div
        className="gaze-zone"
        style={{
          left: gaugeX,
          top: gaugeY,
          width: 60,
          height: 60,
          position: "fixed", // fixed 유지
          pointerEvents: "none",
          zIndex: 1000,
        }}
      >
        <svg className="gauge-ring" width="60" height="60">
          <defs>
            <linearGradient
              // id="gradient-purple"
              id="gradient-blue"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              {/* <stop offset="0%" stopColor="#a960ee" /> */}
              {/* <stop offset="100%" stopColor="#ff6ec4" /> */}
              <stop offset="0%" stopColor="#1d354b" />
              <stop offset="100%" stopColor="#4a7ab7" />
            </linearGradient>
          </defs>
          <circle cx="30" cy="30" r="25" className="gauge-bg" />
          <circle cx="30" cy="30" r="25" className="gauge-progress" strokeDasharray={157} strokeDashoffset={157 - (progress / 100) * 157} />
        </svg>
      </div>
    </>
  );
}

export default GazeRingZone;
