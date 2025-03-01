"use client";

import React, { useState, useEffect } from "react";
import TetrisGame from "./TetrisGame";
import styles from "./tetris.module.css";

const musicOptions = {
  A: { src: "/retroArcade.mp3", title: "Retro Arcade", author: "Beat Mekanik" },
  B: {
    src: "/Ethereal Cafe.mp3",
    title: "Ethereal Cafe",
    author: "Brylie Christopher Oxley",
  },
  C: {
    src: "/Fortsetzung Folgt.mp3",
    title: "Fortsetzung Folgt",
    author: "Gumbel",
  },
  D: { src: "/mewmew.mp3", title: "mewmew", author: "Tea K Pea" },
};

const TetrisModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("A");
  const [audio, setAudio] = useState(null);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const newAudio = new Audio(musicOptions[option].src);
    newAudio.play().catch((err) => console.error("Audio play error:", err));

    setAudio(newAudio);
    setSelectedOption(option);
  };

  useEffect(() => {
    let gameAudio = null;

    if (isOpen) {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      // Start game music
      gameAudio = new Audio(musicOptions[selectedOption].src);
      gameAudio.loop = true;
      gameAudio
        .play()
        .catch((err) => console.error("Game music play error:", err));

      return () => {
        gameAudio.pause();
        gameAudio.currentTime = 0;
      };
    }
  }, [isOpen, selectedOption]);

  return (
    <>
      <label className={styles.title}>Choose your music:</label>
      <div>
        {Object.keys(musicOptions).map((option) => (
          <button
            key={option}
            className={`${styles.customBtn} ${
              selectedOption === option ? styles.active : ""
            }`}
            onClick={() => handleOptionClick(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <button className={styles.customBtn} onClick={toggleModal}>
        Enter If You Dare
      </button>

      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className={styles.customBtnClose} onClick={toggleModal}>
              Close
            </button>
            <TetrisGame audio={audio}/>
            <p>
              Music: {musicOptions[selectedOption].title} by{" "}
              {musicOptions[selectedOption].author}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default TetrisModal;
