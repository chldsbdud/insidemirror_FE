import React from "react";
import "../styles/ArchiveCard.css";

function ArchiveCard({ thumbnail, title, date, onClick }) {
  return (
    <div className="archive-card" onClick={onClick}>
      <img className="card-thumbnail" src={thumbnail} alt="썸네일" />
    </div>
  );
}

export default ArchiveCard;
