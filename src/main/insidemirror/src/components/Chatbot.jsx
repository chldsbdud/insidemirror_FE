import React, { useRef, useEffect, useState } from "react";
import "../styles/Chatbot.css";
import { FaRobot, FaMicrophone } from "react-icons/fa";
import { MdSmartDisplay } from "react-icons/md";

function ChatBotResponse() {
  const [latestResponse, setLatestResponse] = useState("");

  const fetchLatestMessage = async () => {
    const client_id = "default";

    try {
      const response = await fetch(`https://number5.store/chatbot/response/${client_id}`);
      if (!response.ok) throw new Error("네트워크 응답 실패");

      const data = await response.json();
      console.log("최신 응답:", data.text);

      setLatestResponse(data.text);
    } catch (error) {
      console.error("에러 발생:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchLatestMessage, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chatbot-bar-container">
      <div className="chatbot-bar">
        <FaRobot className="chatbot-icon left" />
        <div className="chatbot-text">{latestResponse || "AI 응답을 기다리는 중..."}</div>
        <div className="chatbot-icons-right">
          <FaMicrophone className="chatbot-icon" />
        </div>
      </div>
    </div>
  );
}

export default ChatBotResponse;
