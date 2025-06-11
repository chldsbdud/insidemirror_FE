import React, { useEffect, useState } from "react";
import "../styles/Schedule.css";

function Schedule({ name }) {
  // name을 props로 받음
  const [todayStr, setTodayStr] = useState("");
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [tomorrowSchedules, setTomorrowSchedules] = useState([]);

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (!name || name === "게스트" || name === "Unknown") {
      setTodayStr("");
      setTodaySchedules([]);
      setTomorrowSchedules([]);
      return;
    }

    const todayDate = new Date(); // 오늘 날짜
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(todayDate.getDate() + 1);

    const formatKoreanDate = (date) => {
      const options = { year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" };
      return date.toLocaleDateString("ko-KR", options).replace(/\./g, " ");
    };

    setTodayStr(formatKoreanDate(todayDate));

    const fetchForDate = (date) => {
      const iso = date.toISOString().split("T")[0];
      const url = `${API_BASE}/api/user/schedules?name=${encodeURIComponent(name)}&date=${iso}`;

      return fetch(url)
        .then((res) => res.json())
        .then((data) => data.map((item) => item.title))
        .catch((err) => {
          console.error(`${iso} 일정 불러오기 실패:`, err);
          return [];
        });
    };

    fetchForDate(todayDate).then(setTodaySchedules);
    fetchForDate(tomorrowDate).then(setTomorrowSchedules);
  }, [name]);

  return (
    <div className="schedule-container">
      <div className="schedule-header">{todayStr}</div>

      <div className="schedule-add">
        {/* <input type="date" ... /> */}
        {/* <input type="text" ... /> */}
        {/* <button onClick={handleAddSchedule}>추가</button> */}
      </div>

      <div className="schedule-list-row">
        <div className="schedule-column">
          <div className="schedule-section-header">오늘</div>
          {todaySchedules.length > 0 ? (
            todaySchedules.map((task, i) => (
              <div className="schedule-item" key={`today-${i}`}>
                {task}
              </div>
            ))
          ) : (
            <div className="schedule-item">오늘 일정이 없습니다.</div>
          )}
        </div>

        <div className="schedule-column preview-column">
          <div className="schedule-section-header" style={{ color: "#adabab" }}>
            내일 미리보기
          </div>
          {tomorrowSchedules.length > 0 ? (
            tomorrowSchedules.map((task, i) => (
              <div className="schedule-item preview" key={`tomorrow-${i}`}>
                {task}
              </div>
            ))
          ) : (
            <div className="schedule-item preview">내일 일정이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Schedule;
