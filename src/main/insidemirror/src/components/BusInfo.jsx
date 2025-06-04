import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/BusInfo.css";

function BusInfo() {
  const [busList, setBusList] = useState([]);
  const [stationName, setStationName] = useState("");

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/bus_arrival`);
        const data = response.data;

        setStationName(data.station);
        setBusList(data.buses);
      } catch (error) {
        console.error("버스 정보 불러오기 실패:", error);
      }
    };

    fetchBusData();
    const interval = setInterval(fetchBusData, 15000); // 15초마다 갱신
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bus-info-container">
      <div className="bus-stop-title">{stationName || "정류장 정보 없음"}</div>
      <div className="bus-list">
        {busList.map((bus, idx) => (
          <div className="bus-item" key={idx}>
            <div className="bus-number">{bus.route}</div>
            <div className="bus-arrival">{bus.arrival}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BusInfo;
