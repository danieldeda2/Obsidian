import React from 'react';
import './RecommendationGauge.css';

const RecommendationGauge = ({ score, label, labelClass }) => {
  // Calculate points on the arc
  // Center at (100, 100), radius 80
  const getArcPoint = (percentage) => {
    const angle = Math.PI - (percentage / 100) * Math.PI; // 180° to 0°
    const x = 100 + 80 * Math.cos(angle);
    const y = 100 - 80 * Math.sin(angle);
    return { x: x.toFixed(1), y: y.toFixed(1) };
  };

  const p0 = getArcPoint(0);   // 0%
  const p20 = getArcPoint(20);  // 20%
  const p40 = getArcPoint(40);  // 40%
  const p60 = getArcPoint(60);  // 60%
  const p80 = getArcPoint(80);  // 80%
  const p100 = getArcPoint(100); // 100%

  // Calculate needle based on score
  const needleAngle = Math.PI - (score / 100) * Math.PI;
  
  // Needle starts at center
  const needleStartX = 100;
  const needleStartY = 100;
  
  // Needle ends at radius 60 (10px before arc inner edge at 70)
  const needleEndX = 100 + 60 * Math.cos(needleAngle);
  const needleEndY = 100 - 60 * Math.sin(needleAngle);

  return (
    <div className="recommendation-gauge-container">
      <h2 className="gauge-title">Investment Recommendation</h2>
      
      <div className="gauge-wrapper">
        {/* SVG Gauge */}
        <svg className="gauge-svg" viewBox="0 0 200 120">
          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="20"
            strokeLinecap="round"
          />
          
          {/* Colored Segments */}
          {/* Strong Sell - Red (0-20%) */}
          <path
            d={`M ${p0.x} ${p0.y} A 80 80 0 0 1 ${p20.x} ${p20.y}`}
            fill="none"
            stroke="#dc2626"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.8"
          />
          
          {/* Sell - Orange (20-40%) */}
          <path
            d={`M ${p20.x} ${p20.y} A 80 80 0 0 1 ${p40.x} ${p40.y}`}
            fill="none"
            stroke="#f97316"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.8"
          />
          
          {/* Hold - Yellow (40-60%) */}
          <path
            d={`M ${p40.x} ${p40.y} A 80 80 0 0 1 ${p60.x} ${p60.y}`}
            fill="none"
            stroke="#eab308"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.8"
          />
          
          {/* Buy - Light Green (60-80%) */}
          <path
            d={`M ${p60.x} ${p60.y} A 80 80 0 0 1 ${p80.x} ${p80.y}`}
            fill="none"
            stroke="#84cc16"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.8"
          />
          
          {/* Strong Buy - Green (80-100%) */}
          <path
            d={`M ${p80.x} ${p80.y} A 80 80 0 0 1 ${p100.x} ${p100.y}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.8"
          />
          
          {/* Needle - stops 10px before arc */}
          <line
            x1={needleStartX}
            y1={needleStartY}
            x2={needleEndX}
            y2={needleEndY}
            stroke="#e2e8f0"
            strokeWidth="3"
            className="gauge-needle"
          />
          
          {/* Center Circle - no stroke, just fill */}
          <circle cx="100" cy="100" r="8" fill="#1a1a1a" stroke="none" />
          
          {/* Needle Circle on top - no stroke */}
          <circle cx="100" cy="100" r="5" fill="#8b5cf6" stroke="none" />
        </svg>

        {/* Score Display */}
        <div className="gauge-score-display">
          <span className="gauge-score">{score}</span>
          <span className="gauge-score-max">/100</span>
        </div>
      </div>

      {/* Recommendation Label */}
      <div className={`recommendation-label ${labelClass}`}>
        {label}
      </div>

      {/* Legend */}
      <div className="gauge-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#dc2626' }}></span>
          <span>Strong Sell</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#f97316' }}></span>
          <span>Sell</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#eab308' }}></span>
          <span>Hold</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#84cc16' }}></span>
          <span>Buy</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#10b981' }}></span>
          <span>Strong Buy</span>
        </div>
      </div>
    </div>
  );
};

export default RecommendationGauge;