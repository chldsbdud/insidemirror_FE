import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./SchedulesMobile.css";
import backBtn from "../img/backBtn.png";
import dayjs from "dayjs";

function Schedules() {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.userName || "Unknown";
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");

  //절대경로
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const toggleAddForm = () => {
    setIsAddOpen((prev) => !prev);
  };

  const toLocalDateString = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().split("T")[0];
  };

  const formatKoreanDate = (date) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" };
    return date.toLocaleDateString("ko-KR", options).replace(/\./g, " ");
  };

  //이름 받아오기
  useEffect(() => {
    if (!userName || userName === "Unknown") return;
    fetchSchedules(selectedDate);
  }, [selectedDate, userName]);

  //일정 조회
  const fetchSchedules = async (targetDate) => {
    const dateStr = toLocalDateString(targetDate);
    const encodedName = encodeURIComponent(userName);
    try {
      const res = await fetch(`${API_BASE}/api/user/schedules?name=${encodedName}&date=${dateStr}`);
      if (!res.ok) throw new Error(`조회 실패 (${res.status})`);
      const data = await res.json();
      setSchedules(data);
      setSelectedDateStr(formatKoreanDate(targetDate));
    } catch (err) {
      console.error("일정 불러오기 실패:", err);
      setSchedules([]);
    }
  };

  //일정 추가
  const handleAddSchedule = async () => {
    const encodedName = encodeURIComponent(userName);
    if (!newTitle.trim()) return;

    const schedule = {
      title: newTitle,
      date: toLocalDateString(selectedDate),
    };

    try {
      const res = await fetch(`${API_BASE}/api/schedules?name=${encodedName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });
      if (!res.ok) throw new Error("추가 실패");
      await res.json();
      await fetchSchedules(new Date(schedule.date)); // 직접 갱신
      setNewTitle("");
    } catch (err) {
      console.error("일정 추가 실패:", err);
    }
  };

  //일정 삭제
  const handleDeleteSchedule = async (scheduleId) => {
    const targetDate = toLocalDateString(selectedDate);
    try {
      const res = await fetch(`${API_BASE}/api/schedules/${scheduleId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제 실패");
      await fetchSchedules(new Date(targetDate)); // 직접 갱신
    } catch (err) {
      console.error("일정 삭제 실패:", err);
    }
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setEditTitle(schedule.title);
    setEditDate(schedule.date);
    setIsModalOpen(true);
  };

  //일정 수정
  const updateSchedule = async (scheduleId) => {
    if (!editTitle.trim() || !editDate) {
      alert("제목과 날짜를 모두 입력해주세요.");
      return;
    }

    const updatedData = {
      scheduleId: scheduleId, // 추가
      userId: 1,
      title: editTitle,
      date: toLocalDateString(new Date(editDate)),
    };
    try {
      const response = await fetch(`${API_BASE}/api/schedules/${scheduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`수정 실패: ${response.status} - ${errText}`);
      }

      await response.json();
      setIsModalOpen(false);
      await fetchSchedules(new Date(updatedData.date));
    } catch (error) {
      console.error("일정 수정 실패:", error);
    }
  };

  return (
    <div className="schedule-container">
      <div className="back-button-wrapper">
        <button className="back-button" onClick={() => navigate("/setting")}>
          <img src={backBtn} />
        </button>
        <div className="userName-mobile">{userName} 님의 일정</div>
      </div>

      <div className="calendar-wrapper">
        <Calendar
          onChange={setSelectedDate} // 이것만
          formatDay={(locale, date) => dayjs(date).format("DD")}
          value={selectedDate}
          selectRange={false}
          locale="ko-KR"
        />
      </div>

      <div className="schedule-header-mobile">{formatKoreanDate(selectedDate)}</div>

      <div className="schedule-list-row-mobile">
        <div className="schedule-column-mobile">
          {schedules.length > 0 ? (
            schedules.map((item) => (
              <div className="schedule-item" key={item.scheduleId}>
                {item.title}
                <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleDeleteSchedule(item.scheduleId)}>삭제</button>
                  <button onClick={() => openEditModal(item)}>수정</button>
                </div>
              </div>
            ))
          ) : (
            <div className="schedule-item">일정이 없습니다.</div>
          )}

          {/* 일정 추가 섹션을 아래에 배치 */}
          <div className="schedule-add-bottom">
            <button onClick={toggleAddForm}>+ 일정 추가하기</button>

            <div className={`add-form-wrapper ${isAddOpen ? "open" : ""}`}>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="일정 제목 입력" />
              <button onClick={handleAddSchedule}>추가</button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>일정 수정</h3>
            <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="일정 제목 수정" />
            <div className="modal-buttons">
              <button onClick={() => updateSchedule(editingSchedule.scheduleId)}>저장</button>
              <button onClick={() => setIsModalOpen(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedules;
