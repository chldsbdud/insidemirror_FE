import React, { useState } from "react";
import { useEffect, useRef } from "react";
import axios from "axios";
import "../styles/MainArchive.css";
import ArchiveCard from "./ArchiveCard";
import Archive from "../img/archive.png";
import Photo from "../img/photo.png";
import Folder from "../img/upload-folder.png";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.entry";
import LeftBtn from "../img/leftBtn.png";
import RightBtn from "../img/rightBtn.png";
GlobalWorkerOptions.workerSrc = workerSrc;

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

    // if (newItem.type === "file") {
    //   setSelectedItem(newItem); // 파일이면 우측에 바로 표시
    // }
    if (newItem.type === "file") {
      setSelectedItem({
        ...newItem,
        file: newArchive.file, // 실제 File 객체를 같이 넘겨줘야 함
      });
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
    <>
      <div className="archive-box">
        <img src={Archive} alt="archive" />
        <h2>내 아카이브</h2>
        <button className="create-btn" onClick={() => setShowModal(true)}>
          + 아카이브 생성
        </button>
      </div>
      <div className="main-archive">
        {/* 좌측: 이미지 */}
        <div className="left-panel">
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
              {selectedItem.file && selectedItem.file.type === "application/pdf" ? (
                <PDFViewer file={selectedItem.file} />
              ) : (
                <p>미리보기를 지원하지 않는 파일 형식입니다.</p>
              )}
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
    </>
  );
}

//pdf 관련 코드
function PDFViewer({ file }) {
  const [pdf, setPdf] = useState(null);
  const canvasRef = useState(null);
  const renderTaskRef = useRef(null);

  // ✅ 초기 페이지: 로컬스토리지에서 불러오기
  const initialPage = parseInt(localStorage.getItem("pdfPage") || "1", 10);
  const [pageNumber, setPageNumber] = useState(initialPage);

  // ✅ 페이지 변경 시 로컬스토리지에 저장
  useEffect(() => {
    localStorage.setItem("pdfPage", pageNumber.toString());
  }, [pageNumber]);

  useEffect(() => {
    const loadPDF = async () => {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = getDocument({ data: arrayBuffer });
      const loadedPdf = await loadingTask.promise;
      setPdf(loadedPdf);
    };

    loadPDF();
  }, [file]);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      localStorage.setItem("savedPdf", base64); // 저장
    };
    reader.readAsDataURL(file); // Base64로 읽기
  };

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef[0]) return;

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 0.7 });
      const canvas = canvasRef[0];
      const context = canvas.getContext("2d");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
      } catch (err) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("렌더링 실패:", err);
        }
      }
    };

    renderPage();
  }, [pdf, pageNumber, canvasRef]);

  if (!pdf) return <p>PDF 로딩 중...</p>;

  return (
    <div style={{ position: "relative", paddingBottom: "60px" }}>
      <div style={{ textAlign: "center" }}>
        <canvas ref={(el) => (canvasRef[0] = el)} style={{ width: "100%", maxWidth: "800px", border: "1px solid #ccc" }} />
      </div>

      <div
        style={{
          position: "fixed",
          bottom: "15%",
          right: "10%",
          transform: "translateX(-50%)",
          borderRadius: "8px",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          zIndex: 1000,
        }}
      >
        <button className="btnStyle" onClick={() => setPageNumber((p) => Math.max(1, p - 1))}>
          <img src={LeftBtn} alt="이전" />
        </button>
        <span>
          {pageNumber} / {pdf?.numPages}
        </span>
        <button className="btnStyle" onClick={() => setPageNumber((p) => Math.min(pdf.numPages, p + 1))}>
          <img src={RightBtn} alt="다음" />
        </button>
      </div>
    </div>
  );
}

export default MainArchive;
