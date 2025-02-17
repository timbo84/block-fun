'use client'

import React, { useState } from 'react';
import TetrisGame from './TetrisGame';

const TetrisModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button onClick={toggleModal}>Enter If You Dare</button>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={toggleModal}>Close</button>
            <TetrisGame />
          </div>
        </div>
      )}
    </>
  );
};

export default TetrisModal;
