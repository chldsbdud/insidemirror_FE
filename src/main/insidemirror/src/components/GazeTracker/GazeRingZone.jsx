import React, { useState, useEffect, useRef } from "react";
import "../../styles/GazeRingZone.css";
import { useNavigate } from "react-router-dom";

function GazeRingZone({ gaze, zones }) {
  const [progress, setProgress] = useState(0);
  const [currentZone, setCurrentZone] = useState(null);
  const zoneRef = useRef(null);
  const zoneElementRef = useRef(null);
  const navigate = useNavigate();
  const workerRef = useRef(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL("./gaugeWorker.js", import.meta.url), { type: "module" });
    }

    const worker = workerRef.current;

    // Worker 메시지 응답 처리
    worker.onmessage = (e) => {
      const data = e.data;

      if (data.progress !== undefined) {
        setProgress(data.progress);
      }

      if (data.complete) {
        isRunningRef.current = false;
        setProgress(0);

        const { x, y, width, height } = zones[zoneRef.current];
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        zoneElementRef.current.style.pointerEvents = "none";
        const el = document.elementFromPoint(centerX, centerY);
        zoneElementRef.current.style.pointerEvents = "auto";

        if (el) {
          const button = el.closest("button");
          if (button) {
            button.click();
          } else {
            el.click();
          }
        } else {
          console.warn("클릭할 요소를 찾지 못했습니다.");
        }
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [zones]);

  useEffect(() => {
    if (!workerRef.current) return;
    const worker = workerRef.current;

    let activeKey = null;

    for (const [key, { x, y, width, height }] of Object.entries(zones)) {
      const inside = gaze.x >= x && gaze.x <= x + width && gaze.y >= y && gaze.y <= y + height;
      if (inside) {
        activeKey = key;
        break;
      }
    }

    const zoneChanged = activeKey !== zoneRef.current;

    if (zoneChanged) {
      worker.postMessage("reset");
      setProgress(0);
      isRunningRef.current = false;
      zoneRef.current = activeKey;
      setCurrentZone(activeKey);
    }

    if (activeKey && !isRunningRef.current) {
      worker.postMessage("start");
      isRunningRef.current = true;
    }

    if (!activeKey && zoneRef.current !== null) {
      worker.postMessage("reset");
      setProgress(0);
      isRunningRef.current = false;
      setCurrentZone(null);
      zoneRef.current = null;
    }
  }, [gaze, zones]);

  if (!currentZone) return null;

  const { x, y, width, height } = zones[currentZone];
  const gaugeSize = 60;
  const gaugeX = x + width / 2 - gaugeSize / 2;
  const gaugeY = y + height / 2 - gaugeSize / 2;

  return (
    <>
      <div
        ref={zoneElementRef}
        className="zone-highlight"
        style={{
          left: x,
          top: y,
          width,
          height,
          position: "fixed",
          pointerEvents: "auto",
          zIndex: 999,
        }}
      />
      <div
        className="gaze-zone"
        style={{
          left: gaugeX,
          top: gaugeY,
          width: 60,
          height: 60,
          position: "fixed",
          pointerEvents: "none",
          zIndex: 1000,
        }}
      >
        <svg className="gauge-ring" width="60" height="60">
          <defs>
            <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="0%">
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
