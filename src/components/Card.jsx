// components/Card.jsx
import React from 'react';
import Tilt from 'react-parallax-tilt';
import { useNavigate } from 'react-router-dom';

export default function Card({ id, title, authors, image }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book/${id}`);
  };

  return (
    <Tilt
      glareEnable={false}
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      perspective={1000}
    >
      <div onClick={handleClick} className="card-container">
        <div className="card-image">
          <img src={image} alt={title} className="card-img" />
        </div>
        <div className="card-content">
          <h2 className="card-title">{title}</h2>
          <p className="card-authors">{authors}</p>
        </div>
      </div>
    </Tilt>
  );
}