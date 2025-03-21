import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const exampleQueries = [
    "art grants for indigenous groups in Alberta",
    "tech startup funding in Ontario",
    "small business grants for women entrepreneurs",
    "research funding for renewable energy",
    "COVID-19 recovery grants for restaurants"
  ];

  const handleExampleClick = (example) => {
    setQuery(example);
    onSearch(example);
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for grants (e.g., 'art grants for indigenous groups')"
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
      
      <div className="example-queries">
        <h3>Try these example searches:</h3>
        <div className="examples">
          {exampleQueries.map((example, index) => (
            <button 
              key={index}
              onClick={() => handleExampleClick(example)}
              className="example-button"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchBar;