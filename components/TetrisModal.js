'use client'

import React, { useState, useEffect } from 'react';
import TetrisGame from './TetrisGame';
import styles from './tetris.module.css';

const TetrisModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [audio] = useState(new Audio('/retroArcade.mp3')); // Replace with your actual file path

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      audio.loop = true; // Ensures the music loops
      audio.play();
    } else {
      audio.pause();
      audio.currentTime = 0; // Reset audio when modal closes
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [isOpen, audio]);

  return (
    <>
      <button className={styles.customBtn} onClick={toggleModal}>Enter If You Dare</button>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className={styles.customBtn} onClick={toggleModal}>Close</button>
            <TetrisGame />
            <p>music: Retro Arcade
            by Beat Mekanik</p>
          </div>
        </div>
      )}
    </>
  );
};

export default TetrisModal;
