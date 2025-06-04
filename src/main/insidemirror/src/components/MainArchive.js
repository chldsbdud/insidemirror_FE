import React, { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import "../styles/MainArchive.css";
import ArchiveCard from "./ArchiveCard";
import Archive from "../img/archive.png";
import Photo from "../img/photo.png";
import Folder from "../img/upload-folder.png";

function MainArchive() {
  const [archives, setArchives] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  //이미지 불러오기
  const userName = localStorage.getItem("userName") || "Unknown";
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/images`, {
          params: { name: userName, date: today },
        });
        const serverImages = response.data.map((img) => ({
          type: "image",
          thumbnail: `${process.env.REACT_APP_API_BASE_URL}${img.imagePath}`,
          fileURL: `${process.env.REACT_APP_API_BASE_URL}${img.imagePath}`,
          title: "저장된 이미지",
          date: img.date,
          tags: [],
          categories: [{ label: "이미지 앨범", color: "blue" }],
        }));
        setArchives((prev) => [...serverImages, ...prev]);
      } catch (error) {
        console.error("이미지 불러오기 실패:", error);
      }
    };

    if (userName && userName !== "Unknown") {
      fetchImages();
    }
  }, []);

  const [newArchive, setNewArchive] = useState({
    type: null,
    file: null,
    preview: "",
    title: "",
    tags: [],
    date: new Date().toISOString().split("T")[0],
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 300);
  };

  const handleCreate = () => {
    const objectUrl = newArchive.file ? URL.createObjectURL(newArchive.file) : "";

    const newItem = {
      type: newArchive.type,
      thumbnail: newArchive.preview || "/img/default.png",
      fileURL: objectUrl,
      title: newArchive.title,
      date: newArchive.date,
      tags: newArchive.tags,
      categories: [
        {
          label: newArchive.type === "image" ? "이미지 앨범" : "파일",
          color: newArchive.type === "image" ? "blue" : "purple",
        },
      ],
    };

    setArchives((prev) => [...prev, newItem]);

    if (newItem.type === "file") {
      setSelectedItem(newItem); // 파일이면 우측에 바로 표시
    }

    setNewArchive({
      type: null,
      file: null,
      preview: "",
      title: "",
      tags: [],
      date: new Date().toISOString().split("T")[0],
    });

    handleClose();
  };

  return (
    <div className="main-archive">
      {/* 좌측: 이미지 */}
      <div className="left-panel">
        <div className="archive-box">
          <img src={Archive} alt="archive" />
          <h2>내 아카이브</h2>
          <button className="create-btn" onClick={() => setShowModal(true)}>
            + 아카이브 생성
          </button>
        </div>

        <div className="list-box">
          <img src={Photo} alt="photo" />
          <h3>이미지 앨범</h3>
        </div>

        <div className="archive-grid">
          {archives
            .filter((item) => item.type === "image")
            .map((item, idx) => (
              <ArchiveCard key={idx} {...item} onClick={() => setSelectedItem(item)} />
            ))}
        </div>
      </div>

      {/* 우측: 파일 표시 */}
      <div className="right-panel">
        <div className="list-box">
          <img src={Folder} alt="folder" />
          <h3>파일 미리보기</h3>
        </div>

        {selectedItem && selectedItem.type === "file" ? (
          <div
            className="file-preview-pane"
            style={{
              maxHeight: "75vh",
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <embed src={selectedItem.fileURL} type="application/pdf" width="600px" height="1200px" />
          </div>
        ) : (
          <p style={{ color: "#aaa" }}>선택된 파일이 없습니다.</p>
        )}
      </div>
      {showModal && (
        <div className={`bottom-sheet ${isClosing ? "slide-down" : "slide-up"}`}>
          {!newArchive.type ? (
            <button onClick={() => document.getElementById("uploadInput").click()}>📁 사진 또는 파일 선택</button>
          ) : (
            <>
              {newArchive.preview && <img src={newArchive.preview} alt="preview" style={{ width: "100%", maxHeight: "150px", objectFit: "cover" }} />}
              <input type="text" placeholder="제목 입력" value={newArchive.title} onChange={(e) => setNewArchive({ ...newArchive, title: e.target.value })} />
              <input
                type="text"
                placeholder="태그 입력 (쉼표로 구분)"
                onChange={(e) =>
                  setNewArchive({
                    ...newArchive,
                    tags: e.target.value.split(",").map((tag) => tag.trim()),
                  })
                }
              />
              <button onClick={handleCreate}>생성</button>
            </>
          )}

          <input
            id="uploadInput"
            type="file"
            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xlsx"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const extension = file.name.split(".").pop().toLowerCase();
              const imageTypes = ["jpg", "jpeg", "png"];
              if (imageTypes.includes(extension)) {
                const preview = URL.createObjectURL(file);
                setNewArchive({ ...newArchive, type: "image", file, preview });
              } else {
                const preview = "/img/pdf_icon.png";
                setNewArchive({ ...newArchive, type: "file", file, preview });
              }
            }}
          />

          <button className="cancel-btn" onClick={handleClose}>
            취소
          </button>
        </div>
      )}
    </div>
  );
}

export default MainArchive;
