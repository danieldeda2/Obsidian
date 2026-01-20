import React from 'react';
import './FeatureCards.css';

const features = [
  {
    id: 1,
    icon: '📊',
    title: 'Technical Analysis',
    description: 'RSI, MACD, Bollinger Bands, and moving averages in real-time',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)'
  },
  {
    id: 2,
    icon: '💰',
    title: 'Fundamentals',
    description: 'P/E ratios, EPS, debt-to-equity, and valuation analysis',
    gradient: 'linear-gradient(135deg, #10b981, #059669)'
  },
  {
    id: 3,
    icon: '📰',
    title: 'Sentiment Analysis',
    description: 'AI-powered news sentiment and social media tracking',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
  },
  {
    id: 4,
    icon: '⚠️',
    title: 'Risk Assessment',
    description: 'Volatility metrics, beta analysis, and risk scoring',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
  }
];

const FeatureCards = () => {
  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">
            Comprehensive Market Analysis
          </h2>
          <p className="features-subtitle">
            Powered by institutional-grade data and algorithms
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={feature.id} 
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-card-inner">
                <div 
                  className="feature-icon-wrapper"
                  style={{ background: feature.gradient }}
                >
                  <span className="feature-icon">{feature.icon}</span>
                </div>
                
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                
                <div className="feature-glow" style={{ background: feature.gradient }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;