import React, { useEffect, useState } from "react";
import "../styles/Schedule.css";

function Schedule({ name }) {
  const [todayStr, setTodayStr] = useState("");
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [tomorrowSchedules, setTomorrowSchedules] = useState([]);
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [retryCount, setRetryCount] = useState(0); // 재시도 횟수

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const todayDate = new Date(); // 오늘 날짜
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(todayDate.getDate() + 1);

    const formatKoreanDate = (date) => {
      const options = { year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" };
      return date.toLocaleDateString("ko-KR", options).replace(/\./g, " ");
    };

    // 오늘 날짜 업데이트 함수
    const updateTodayDate = () => {
      const newDate = new Date();
      setTodayStr(formatKoreanDate(newDate));
    };

    // 매초마다 오늘 날짜 갱신
    const intervalId = setInterval(updateTodayDate, 1000); // 1000ms (1초)마다 갱신

    // 초기 실행
    updateTodayDate();

    // 클린업: 컴포넌트 언마운트 시 interval 종료
    return () => clearInterval(intervalId);
  }, []);

  const fetchForDate = (date) => {
    const iso = date.toISOString().split("T")[0]; // ISO 형식으로 변환
    const encodedDate = encodeURIComponent(iso); // 날짜를 URL-safe로 인코딩
    const url = `${API_BASE}/api/user/schedules?name=${encodeURIComponent(name)}&date=${encodedDate}`; // date 파라미터 인코딩

    console.log("요청 URL:", url); // 요청 URL 확인

    return fetch(url)
      .then((res) => {
        if (!res.ok) {
          console.log(`Error fetching data for date: ${iso}, response: ${res.statusText}`);
          return []; // 응답이 없으면 빈 배열 반환
        }
        return res.json();
      })
      .then((data) => {
        return data.map((item) => item.title); // 일정 제목만 추출
      })
      .catch((err) => {
        console.error(`${iso} 일정 불러오기 실패:`, err);
        return []; // 오류가 나면 빈 배열 반환
      });
  };

  // 요청 재시도 로직
  const fetchSchedulesWithRetry = async (date, maxRetries = 5) => {
    let retries = 0;
    let result = [];

    while (retries < maxRetries) {
      result = await fetchForDate(date);

      if (result.length > 0) {
        break; // 데이터가 있으면 종료
      }

      retries++;
      console.log(`재시도 ${retries} / ${maxRetries}`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 후 재시도
    }

    return result;
  };

  useEffect(() => {
    if (!name || name === "게스트" || name === "Unknown") {
      setTodayStr("");
      setTodaySchedules([]);
      setTomorrowSchedules([]);
      return;
    }

    const todayDate = new Date();
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(todayDate.getDate() + 1);

    // 로딩 상태를 true로 설정하고 요청 시작
    setLoading(true);

    // 두 요청을 병렬로 처리
    Promise.all([
      fetchSchedulesWithRetry(todayDate), // 오늘 일정
      fetchSchedulesWithRetry(tomorrowDate), // 내일 일정
    ])
      .then(([todayData, tomorrowData]) => {
        console.log("오늘 일정:", todayData);
        console.log("내일 일정:", tomorrowData);
        setTodaySchedules(todayData); // 오늘 일정 설정
        setTomorrowSchedules(tomorrowData); // 내일 일정 설정
        setLoading(false); // 요청 완료 후 로딩 상태를 false로 변경
      })
      .catch((err) => {
        console.error("일정 불러오기 실패:", err);
        setLoading(false); // 오류 발생 시에도 로딩 상태를 false로 변경
      });
  }, [name, retryCount]);

  return (
    <div className="schedule-container">
      <div className="schedule-header">{todayStr}</div>

      {loading ? (
        <div>로딩 중...</div> // 로딩 중일 때 표시할 내용
      ) : (
        <div className="schedule-list">
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
                <div className="schedule-item" key={`tomorrow-${i}`}>
                  {task}
                </div>
              ))
            ) : (
              <div className="schedule-item">내일 일정이 없습니다.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;
