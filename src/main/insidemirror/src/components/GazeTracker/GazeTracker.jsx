import { useEffect } from "react";

function GazeTracker({ onGaze }) {
  useEffect(() => {
    let socket;

    const connect = () => {
      socket = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_API_BASE_URL}/ws`);

      socket.onopen = () => {
        console.log("WebSocket connected");
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Gaze data:", data); // 추가

        if (onGaze) {
          onGaze({ x: data.x, y: data.y }); // 외부로 전달!
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      socket.onclose = () => {
        console.warn("WebSocket closed, retrying in 3 seconds...");
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [onGaze]);

  return null; // UI는 안 띄움
}

export default GazeTracker;
