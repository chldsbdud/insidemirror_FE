import React, { useEffect, useState, useRef } from "react";

import "../styles/WeatherWidget.css";

const API_KEY = "7d8d84144648b09a5fa765153940cf20"; // <- 본인의 OpenWeatherMap API 키 입력
const LAT = 37.5665; // 서울 위도
const LON = 126.978; // 서울 경도

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  //좌표 구하기
  const weatherRef = useRef(null);

  useEffect(() => {
    if (weather && weatherRef.current) {
      const rect = weatherRef.current.getBoundingClientRect();
      console.log("Weather Summary 좌표:", {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [weather]); // weather가 바뀌었을 때만 실행

  const toggleDetail = () => {
    if (!showDetail) {
      // 열기
      setShowDetail(true);
      setIsContentVisible(true);
    } else {
      // 닫기 (콘텐츠 숨김은 약간 지연)
      setShowDetail(false);
      setTimeout(() => setIsContentVisible(false), 500); // transition 시간과 일치
    }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=kr`);
        const data = await res.json();

        // 오늘 날짜의 데이터만 추출
        const today = new Date().getDate();
        const todayData = data.list.filter((item) => new Date(item.dt_txt).getDate() === today);

        const temps = todayData.map((item) => item.main.temp);
        const minTemp = Math.min(...temps).toFixed(1);
        const maxTemp = Math.max(...temps).toFixed(1);
        const status = todayData[0].weather[0].description;
        const icon = todayData[0].weather[0].icon;
        const city = data.city.name;
        setWeather({ minTemp, maxTemp, status, icon, city });

        setHourly(todayData.slice(0, 6)); // 6시간치
      } catch (error) {
        console.error("날씨 정보 불러오기 실패:", error);
      }
    };

    fetchWeather();
  }, []);

  const getClothingSuggestion = (temp) => {
    if (temp >= 28) return "민소매, 반팔, 얇은 셔츠";
    if (temp >= 23) return "반팔, 얇은 셔츠, 면바지";
    if (temp >= 17) return "얇은 가디건, 맨투맨";
    if (temp >= 12) return "가디건, 니트, 청바지";
    if (temp >= 6) return "코트, 가죽자켓";
    return "패딩, 두꺼운 외투";
  };

  return (
    <div className="weather-widget" onClick={() => setShowDetail((prev) => !prev)}>
      {/* 요약 정보 */}
      <div className={`fade-section ${showDetail ? "fade-out" : "fade-in"}`}>
        {weather && (
          <div className="weather-summary" ref={weatherRef}>
            {weather.icon && <img className="weather-icon" src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt="날씨 아이콘" />}
            <div className="weather-location">{weather.city}</div>
            <div className="weather-status">{weather.status}</div>
            <div className="weather-temp">
              <span>최저 {weather.minTemp}°</span> / <span>최고 {weather.maxTemp}°</span>
            </div>
          </div>
        )}
      </div>

      {/* 상세 정보 */}
      <div className={`fade-section ${showDetail ? "fade-in" : "fade-out"}`}>
        <div className="weather-detail">
          {hourly.map((item, idx) => {
            const hour = new Date(item.dt_txt).getHours();
            const temp = item.main.temp.toFixed(1);
            const clothing = getClothingSuggestion(item.main.temp);

            return (
              <div className="hour-block" key={idx}>
                <div className="hour">{hour}시</div>
                <div className="hour-temp">{temp}°</div>
                <div className="clothing">{clothing}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WeatherWidget;
