import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/NewsTicker.css";

function NewsTicker() {
  const [newsList, setNewsList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  //절대경로
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    // 뉴스 헤드라인 API 호출

    const fetchNews = async () => {
      try {
        const response = await axios.get(`${API_BASE}/news_headlines`);
        setNewsList(response.data);
      } catch (error) {
        console.error("뉴스 불러오기 실패:", error);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (newsList.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsList.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [newsList]);

  if (newsList.length === 0) {
    return <div className="news-ticker-enhanced">뉴스 로딩 중...</div>;
  }

  const { section, title } = newsList[currentIndex];

  return (
    <div className="news-ticker-enhanced">
      <span className="category-label">{section}</span>
      <span className="news-text">{title}</span>
    </div>
  );
}

export default NewsTicker;
