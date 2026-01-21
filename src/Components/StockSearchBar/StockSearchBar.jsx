import React, { useState, useRef, useEffect } from 'react';
import { searchStocks } from '../../Services/StockAPI';
import './StockSearchBar.css';

const StockSearchBar = ({ onSearch }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    // Debounce API calls - wait 500ms after user stops typing
    if (input.length > 0) {
      setIsLoading(true);
      
      // Clear previous timeout
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      
      // Set new timeout
      searchTimeout.current = setTimeout(async () => {
        const results = await searchStocks(input);
        setSuggestions(results.slice(0, 8)); // Limit to 8 results
        setIsLoading(false);
      }, 500);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.toUpperCase());
      setInput('');
      setSuggestions([]);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (ticker) => {
    setInput(ticker);
    onSearch(ticker);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  return (
    <div className="stock-search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className={`search-bar-glass ${isFocused ? 'focused' : ''}`}>
          <div className="search-icon">
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" strokeWidth="2"/>
              </svg>
            )}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Enter stock ticker or company name (e.g., AAPL, Apple)"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
          
          <button type="submit" className="search-button">
            <span className="button-text">Analyze</span>
            <span className="button-arrow">→</span>
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions */}
      {suggestions.length > 0 && isFocused && (
        <div className="suggestions-dropdown">
          {suggestions.map((stock, index) => (
            <div
              key={`${stock.ticker}-${index}`}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(stock.ticker)}
            >
              <div className="suggestion-left">
                <span className="suggestion-ticker">{stock.ticker}</span>
                <span className="suggestion-type">{stock.type}</span>
              </div>
              <span className="suggestion-name">{stock.name}</span>
            </div>
          ))}
        </div>
      )}

      {isLoading && isFocused && (
        <div className="suggestions-dropdown">
          <div className="loading-message">Searching...</div>
        </div>
      )}
    </div>
  );
};

export default StockSearchBar;