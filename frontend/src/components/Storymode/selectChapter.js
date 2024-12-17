import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./selectChapter.css";
import introduction from "../tokeni/introduction.png";

const SelectChapter = () => {
  const navigate = useNavigate();
  const [isDarken, setIsDarken] = useState(false);
  const containerRef = useRef(null);

  const handleChapterClick = async () => {
    try {
      // Request fullscreen in response to user click
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }

      // Trigger darkening effect
      setIsDarken(true);

      // Set the chapter to be passed as state (chapter 1 in this case)
      const selectedChapter = 'chapterOne'; // Modify this if there are other chapters

      // Navigate to Chapter One, passing the selected chapter as state
      setTimeout(() => {
        navigate("/chapter-one", { state: { chapter: selectedChapter } });
      }, 3000);
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`select-chapter-container ${isDarken ? "darken" : ""}`}
    >
      {!isDarken && (
        <div className="overlay">
          <h1 className="select-chapter-title">Select a Chapter</h1>
          <div className="chapter-grid">
            <div className="chapter-item" onClick={handleChapterClick}>
              <img
                className="chapter-image"
                src={introduction}
                alt="Introduction"
              />
              <h2>Introduction</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectChapter;
