import React from 'react';
import './RiskMeter.css';

const RiskMeter = ({ beta, volatility }) => {
  // Calculate risk score (0-100)
  const calculateRiskScore = () => {
    let score = 50; // Start neutral

    // Beta contribution (50% weight)
    if (beta < 0.5) score -= 20;
    else if (beta < 0.8) score -= 10;
    else if (beta <= 1.2) score += 0;
    else if (beta <= 1.5) score += 15;
    else score += 25;

    // Volatility contribution (50% weight)
    if (volatility < 1) score -= 5;
    else if (volatility < 2) score += 0;
    else if (volatility < 3) score += 10;
    else if (volatility < 5) score += 15;
    else score += 25;

    return Math.max(0, Math.min(100, score));
  };

  const riskScore = calculateRiskScore();

  const getRiskLevel = (score) => {
    if (score < 30) return { text: 'Low Risk', class: 'low', color: '#10b981' };
    if (score < 50) return { text: 'Moderate Risk', class: 'moderate', color: '#eab308' };
    if (score < 70) return { text: 'High Risk', class: 'high', color: '#f97316' };
    return { text: 'Very High Risk', class: 'very-high', color: '#ef4444' };
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="risk-meter-container">
      <h3 className="risk-title">Risk Assessment</h3>

      <div className="risk-score-display">
        <div className="risk-circle" style={{ borderColor: riskLevel.color }}>
          <span className="risk-score" style={{ color: riskLevel.color }}>{riskScore}</span>
          <span className="risk-score-label">Risk Score</span>
        </div>
      </div>

      <div className={`risk-label ${riskLevel.class}`} style={{ color: riskLevel.color }}>
        {riskLevel.text}
      </div>

      <div className="risk-bar-container">
        <div className="risk-bar-track">
          <div 
            className="risk-bar-fill" 
            style={{ 
              width: `${riskScore}%`,
              background: `linear-gradient(90deg, #10b981, ${riskLevel.color})`
            }}
          ></div>
        </div>
        <div className="risk-bar-labels">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
          <span>Very High</span>
        </div>
      </div>

      <div className="risk-factors">
        <h4 className="risk-factors-title">Risk Factors</h4>
        <div className="risk-factor-item">
          <div className="factor-header">
            <span className="factor-label">Beta (Market Volatility)</span>
            <span className="factor-value">{beta !== 'N/A' ? beta : 'N/A'}</span>
          </div>
          <div className="factor-bar">
            <div 
              className="factor-fill"
              style={{ 
                width: `${Math.min(beta * 50, 100)}%`,
                background: beta > 1.5 ? '#ef4444' : beta > 1 ? '#f97316' : '#10b981'
              }}
            ></div>
          </div>
          <p className="factor-description">
            {beta < 1 ? 'Less volatile than market' : beta > 1.5 ? 'Highly volatile' : 'Average volatility'}
          </p>
        </div>

        <div className="risk-factor-item">
          <div className="factor-header">
            <span className="factor-label">Current Volatility</span>
            <span className="factor-value">{volatility.toFixed(2)}%</span>
          </div>
          <div className="factor-bar">
            <div 
              className="factor-fill"
              style={{ 
                width: `${Math.min(volatility * 20, 100)}%`,
                background: volatility > 5 ? '#ef4444' : volatility > 3 ? '#f97316' : '#10b981'
              }}
            ></div>
          </div>
          <p className="factor-description">
            {volatility < 2 ? 'Stable price movement' : volatility > 5 ? 'High price swings' : 'Moderate fluctuations'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskMeter;
