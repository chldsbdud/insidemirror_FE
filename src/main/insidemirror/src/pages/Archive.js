import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Archive.css";
import cameraBlack from "../img/cameraBlack.png";

function Archive() {
  const navigate = useNavigate();
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedPdfs, setUploadedPdfs] = useState([]);
  const [ddayTitle, setDdayTitle] = useState("");
  const [ddayDate, setDdayDate] = useState(null);
  const [notionLink, setNotionLink] = useState("");
  const [currentIndex, setCurrentIndex] = useState(2); // 중앙 인덱스

  // D-Day 계산
  const ddayCount = ddayDate ? Math.ceil((new Date(ddayDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  //이미지 업로드
  const [centerIndex, setCenterIndex] = useState(0);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setUploadedImages(imageUrls);
    setCenterIndex(0); // 초기 중심 이미지
  };

  //카메라 페이지에서 찍은 사진 가져오기
  useEffect(() => {
    const savedImage = localStorage.getItem("capturedImage");
    if (savedImage) {
      setUploadedImages((prev) => [...prev, savedImage]);
      setCenterIndex(0); // 추가된 이미지를 중심에 두기
      localStorage.removeItem("capturedImage"); // 한번만 보여주고 초기화 (선택)
    }
  }, []);

  //양쪽 이미지
  const handlePrev = () => {
    setCenterIndex((prev) => (prev === 0 ? uploadedImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCenterIndex((prev) => (prev === uploadedImages.length - 1 ? 0 : prev + 1));
  };

  //PDF 업로드
  const handlePdfUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedPdfs(files);
  };

  const handleDdayChange = (e) => setDdayDate(e.target.value);
  const handleTitleChange = (e) => setDdayTitle(e.target.value);
  const handleNotionLinkChange = (e) => setNotionLink(e.target.value);

  return (
    <div className="archive-container">
      <h2>My Archive</h2>
      <section className="archive-section">
        <h3>📷 사진 업로드</h3>
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} />

        {uploadedImages.length > 0 && (
          <div className="carousel-wrapper">
            <button className="nav-btn left" onClick={handlePrev}>
              ‹
            </button>
            <div className="carousel-track">
              {uploadedImages.map((img, index) => {
                const offset = index - centerIndex;
                let className = "carousel-img";

                if (offset === 0) className += " center";
                else if (offset === -1 || offset === 1) className += " side";
                else className += " hidden";

                return <img key={index} src={img} alt={`img-${index}`} className={className} />;
              })}
            </div>
            <button className="nav-btn right" onClick={handleNext}>
              ›
            </button>
          </div>
        )}
      </section>

      <section className="archive-section">
        <h3>📎 PDF 업로드</h3>
        <input type="file" accept="application/pdf" multiple onChange={handlePdfUpload} />
        <ul className="pdf-list">
          {uploadedPdfs.map((pdf, idx) => (
            <li key={idx}>{pdf.name}</li>
          ))}
        </ul>
      </section>

      <section className="archive-section">
        <h3>📅 D-Day 설정</h3>
        <input type="date" onChange={handleDdayChange} />
        <input type="text" placeholder="D-Day 제목" onChange={handleTitleChange} />
        <p>
          {ddayTitle}까지 D-{ddayCount}
        </p>
      </section>

      <section className="archive-section">
        <h3>🗂️ 노션 페이지</h3>
        <input type="text" placeholder="노션 공유 링크 입력" onChange={handleNotionLinkChange} />
        {notionLink && <iframe src={notionLink} title="Notion" className="notion-embed" frameBorder="0"></iframe>}
      </section>
    </div>
  );
}

export default Archive;
