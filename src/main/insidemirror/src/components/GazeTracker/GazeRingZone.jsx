import { useEffect, useState } from "react";
import "../../styles/GazeRingZone.css";

function GazeRingZone({ gaze, x, y, width, height, onGazeComplete }) {
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(null);
  const [visible, setVisible] = useState(false);

  const inside = gaze.x >= x && gaze.x <= x + width && gaze.y >= y && gaze.y <= y + height;

  useEffect(() => {
    if (inside) {
      setVisible(true);
      if (!timer) {
        const t = setInterval(() => {
          setProgress((p) => {
            if (p >= 100) {
              clearInterval(t);
              setTimer(null);
              onGazeComplete();
              return 0;
            }
            return p + 1.67;
          });
        }, 50);
        setTimer(t);
      }
    } else {
      clearInterval(timer);
      setTimer(null);
      setProgress(0);
      setVisible(false);
    }

    return () => clearInterval(timer);
  }, [inside]);

  return (
    <>
      {visible && (
        <div
          className="gaze-zone"
          style={{
            position: "fixed", // 화면 절대 좌표 기준
            left: x,
            top: y,
            width,
            height,
            pointerEvents: "none", // 클릭 방지
            zIndex: 1000,
          }}
        >
          <svg className="gauge-ring" width="60" height="60">
            <circle cx="30" cy="30" r="25" className="gauge-bg" />
            <circle cx="30" cy="30" r="25" className="gauge-progress" strokeDasharray={157} strokeDashoffset={157 - (progress / 100) * 157} />
          </svg>
        </div>
      )}
    </>
  );
}

export default GazeRingZone;
