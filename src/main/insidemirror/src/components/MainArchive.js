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
  const today = new Date().toISOString().slice(0, 10);
  const [selectedItem, setSelectedItem] = useState({
    type: "file",
    title: "기본 PDF 파일",
    file: null,
    thumbnail: "/img/pdf_icon.png",
    fileURL: "/sample.pdf",
    tags: [],
    date: today,
    categories: [{ label: "기본 파일", color: "purple" }],
  });

  const leftBtnRef = useRef(null);
  const rightBtnRef = useRef(null);

  //이미지 불러오기
  const userName = localStorage.getItem("userName") || "Unknown";

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

  useEffect(() => {
    const logRect = (name, ref) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        console.log(`${name} 버튼 좌표:`, {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    // 컴포넌트가 처음 마운트될 때 한 번만 좌표 출력
    logRect("왼쪽", leftBtnRef);
    logRect("오른쪽", rightBtnRef);
  }, []);

  //파일 고정
  useEffect(() => {
    const fetchDefaultPDF = async () => {
      try {
        const res = await fetch("/sample.pdf");
        const blob = await res.blob();
        const file = new File([blob], "sample.pdf", { type: blob.type });

        setSelectedItem((prev) => ({
          ...prev,
          file,
        }));
      } catch (error) {
        console.error("기본 PDF 불러오기 실패:", error);
      }
    };

    fetchDefaultPDF();
  }, []);

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
            <PDFViewer file={selectedItem?.file || null} leftBtnRef={leftBtnRef} rightBtnRef={rightBtnRef} />
          </div>
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

function PDFViewer({ file, leftBtnRef, rightBtnRef }) {
  const [pdf, setPdf] = useState(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const buttonRef = useRef();

  const initialPage = parseInt(localStorage.getItem("pdfPage") || "1", 10);
  const [pageNumber, setPageNumber] = useState(initialPage);

  useEffect(() => {
    localStorage.setItem("pdfPage", pageNumber.toString());
  }, [pageNumber]);

  useEffect(() => {
    const loadPDF = async () => {
      if (!file) return;
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = getDocument({ data: arrayBuffer });
      const loadedPdf = await loadingTask.promise;
      setPdf(loadedPdf);
    };
    loadPDF();
  }, [file]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;

      const totalPages = pdf.numPages;
      const validPage = Math.min(Math.max(1, pageNumber), totalPages);

      const page = await pdf.getPage(validPage);
      const viewport = page.getViewport({ scale: 0.7 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const renderContext = { canvasContext: context, viewport };
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
  }, [pdf, pageNumber]);

  return (
    <div style={{ position: "relative", paddingBottom: "60px" }}>
      <div style={{ textAlign: "center" }}>
        {file ? (
          <canvas ref={canvasRef} style={{ width: "100%", maxWidth: "800px", border: "1px solid #ccc" }} />
        ) : (
          <p style={{ color: "#aaa" }}>파일을 업로드해 주세요.</p>
        )}
      </div>

      {/* 항상 떠 있는 페이지 이동 버튼 */}
      <div
        ref={buttonRef}
        style={{
          position: "fixed",
          bottom: "15%",
          left: "50%",
          transform: "translateX(-50%)",

          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px 16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          zIndex: 1000,
        }}
      >
        <button className="btnStyle" onClick={() => setPageNumber((p) => Math.max(1, p - 1))} ref={leftBtnRef}>
          <img src={LeftBtn} alt="이전" />
        </button>
        <span>{pageNumber}</span>
        <button className="btnStyle" onClick={() => setPageNumber((p) => Math.min(pdf?.numPages || 1, p + 1))} ref={rightBtnRef}>
          <img src={RightBtn} alt="다음" />
        </button>
      </div>
    </div>
  );
}

export default MainArchive;
