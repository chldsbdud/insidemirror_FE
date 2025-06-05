import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/BusInfo.css";

function BusInfo() {
  const [busList, setBusList] = useState([]); // 초기값 빈 배열
  const [stationName, setStationName] = useState(""); // 초기값 빈 문자열

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/bus_arrival`);
        const data = response.data;

        // 데이터 유효성 검사
        if (data && Array.isArray(data.buses)) {
          setStationName(data.station || "알 수 없음");
          setBusList(data.buses);
        } else {
          console.warn("버스 데이터가 예상과 다릅니다:", data);
          setStationName("정류장 정보 없음");
          setBusList([]);
        }
      } catch (error) {
        console.error("버스 정보 불러오기 실패:", error);
        setStationName("정류장 정보 없음");
        setBusList([]);
      }
    };

    fetchBusData();
    const interval = setInterval(fetchBusData, 15000); // 15초마다 갱신
    return () => clearInterval(interval);
  }, [API_BASE]);

  return (
    <div className="bus-info-container">
      <div className="bus-stop-title">{stationName}</div>

      {busList.length === 0 ? (
        <div className="bus-empty">도착 예정 버스 없음</div>
      ) : (
        <div className="bus-list">
          {busList.map((bus, idx) => (
            <div className="bus-item" key={idx}>
              <div className="bus-number">{bus.route || "노선 정보 없음"}</div>
              <div className="bus-arrival">{bus.arrival || "도착 정보 없음"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BusInfo;
