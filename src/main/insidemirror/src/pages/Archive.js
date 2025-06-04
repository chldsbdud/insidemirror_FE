import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Archive.css";
import cameraBlack from "../img/cameraBlack.png";
import axios from "axios";

function Archive() {
  const navigate = useNavigate();
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedPdfs, setUploadedPdfs] = useState([]);
  const [ddayTitle, setDdayTitle] = useState("");
  const [ddayDate, setDdayDate] = useState(null);
  const [notionLink, setNotionLink] = useState("");
  const [currentIndex, setCurrentIndex] = useState(2); // 중앙 인덱스

  //이미지 조회 api
  useEffect(() => {
    const userName = localStorage.getItem("userName") || "Unknown";
    const today = new Date().toISOString().slice(0, 10);

    // 카메라에서 찍은 이미지 로드
    const savedImage = localStorage.getItem("capturedImage");
    if (savedImage) {
      setUploadedImages((prev) => [...prev, savedImage]);
      setCenterIndex(0);
      localStorage.removeItem("capturedImage");
    }

    // 서버에서 사용자 이미지 불러오기
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/images`, {
          params: { name: userName, date: today },
        });

        const imageUrls = response.data.map((img) => `${process.env.REACT_APP_API_BASE_URL}${img.imagePath}`);
        setUploadedImages((prev) => [...imageUrls, ...prev]);
        setCenterIndex(0);
      } catch (error) {
        console.error("이미지 불러오기 실패:", error);
      }
    };

    if (userName !== "Unknown") {
      fetchImages();
    }
  }, []);

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

  return (
    <div className="archive-container">
      <h2>My Archive</h2>
      <section className="archive-section">
        <h3>사진 업로드</h3>

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
    </div>
  );
}

export default Archive;
