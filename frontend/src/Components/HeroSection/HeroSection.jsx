import React, { useState, useEffect } from 'react';
import StockSearchBar from '../StockSearchBar/StockSearchBar';
import './HeroSection.css';

const HeroSection = ({ onSearch }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="hero-section">
      {/* Animated Background Grid */}
      <div className="hex-grid"></div>
      
      {/* Floating Geometric Shapes */}
      <div className="floating-shapes">
        <div 
          className="shape shape-1" 
          style={{ 
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` 
          }}
        ></div>
        <div 
          className="shape shape-2"
          style={{ 
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` 
          }}
        ></div>
        <div 
          className="shape shape-3"
          style={{ 
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 1.5}px)` 
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="hero-content">
        <div className="hero-header">
          <div className="diamond-accent">◆</div>
          <h1 className="hero-title">
            <span className="obsidian-gradient">OBSIDIAN</span>
          </h1>
          <div className="diamond-accent">◆</div>
        </div>
        
        <div className="hero-divider"></div>
        
        <p className="hero-subtitle">Precision Trading Intelligence</p>
        
        <StockSearchBar onSearch={onSearch} />
        
        <p className="hero-description">
          Advanced quantitative analysis powered by real-time market data
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
