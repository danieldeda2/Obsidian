import React, { useState, useEffect } from 'react';
import './MarketPulse.css';

// Mock data - you'll replace this with real API data later
const MARKET_INDICES = [
  { symbol: 'S&P 500', value: 4783.45, change: 0.82, changeValue: 38.92 },
  { symbol: 'NASDAQ', value: 14967.08, change: -0.31, changeValue: -46.44 },
  { symbol: 'DOW', value: 37305.16, change: 1.18, changeValue: 434.82 },
  { symbol: 'RUSSELL 2000', value: 2027.07, change: 0.56, changeValue: 11.27 },
  { symbol: 'VIX', value: 13.42, change: -2.47, changeValue: -0.34 },
];

const MarketPulse = () => {
  const [tickerPosition, setTickerPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPosition((prev) => (prev <= -50 ? 0 : prev - 0.1));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="market-pulse-section">
      <div className="pulse-header">
        <div className="pulse-indicator">
          <span className="pulse-dot"></span>
          <span className="pulse-text">LIVE</span>
        </div>
        <h3 className="pulse-title">Market Pulse</h3>
      </div>

      <div className="ticker-wrapper">
        <div 
          className="ticker-track"
          style={{ transform: `translateX(${tickerPosition}%)` }}
        >
          {/* Duplicate the indices to create seamless loop */}
          {[...MARKET_INDICES, ...MARKET_INDICES].map((index, i) => (
            <div key={i} className="ticker-item">
              <span className="ticker-symbol">{index.symbol}</span>
              <span className="ticker-value">{index.value.toLocaleString()}</span>
              <span className={`ticker-change ${index.change >= 0 ? 'positive' : 'negative'}`}>
                {index.change >= 0 ? '▲' : '▼'} {Math.abs(index.change)}%
                <span className="ticker-change-value">
                  ({index.change >= 0 ? '+' : ''}{index.changeValue.toFixed(2)})
                </span>
              </span>
              <span className="ticker-separator">|</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pulse-footer">
        <p className="pulse-disclaimer">
          Market data delayed by 15 minutes • Updated continuously during market hours
        </p>
      </div>
    </section>
  );
};

export default MarketPulse;
