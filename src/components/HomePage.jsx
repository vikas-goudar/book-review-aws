// src/components/HomePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'
const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/home', { state: { query: searchQuery } });
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Book Review Site</h1>
      <form onSubmit={handleSubmit} className="home-search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for books..."
          className="home-search-input"
        />
        <button type="submit" className="home-search-button">
          Search
        </button>
      </form>
    </div>
  );
};

export default HomePage;