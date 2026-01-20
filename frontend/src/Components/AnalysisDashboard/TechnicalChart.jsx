import React, { useState, useEffect } from 'react';
import { getHistoricalData } from '../../Services/StockAPI';
import './TechnicalChart.css';

const TechnicalChart = ({ ticker }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30'); // 30 days default

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      const data = await getHistoricalData(ticker, 'D', parseInt(timeframe));
      setChartData(data);
      setLoading(false);
    };

    fetchChartData();
  }, [ticker, timeframe]);

  if (loading) {
    return (
      <div className="chart-container">
        <div className="chart-loading">
          <div className="spinner"></div>
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-error">No chart data available</div>
      </div>
    );
  }

  // Find min and max for scaling
  const prices = chartData.map(d => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  // Chart dimensions
  const width = 100; // percentage
  const height = 200; // pixels
  const padding = 20;

  // Create SVG path
  const points = chartData.map((data, index) => {
    const x = (index / (chartData.length - 1)) * 100;
    const y = height - ((data.close - minPrice) / priceRange) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  const pathData = `M ${points}`;

  // Calculate price change
  const firstPrice = chartData[0].close;
  const lastPrice = chartData[chartData.length - 1].close;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = (priceChange / firstPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Price Chart</h3>
        <div className="timeframe-selector">
          <button 
            className={timeframe === '7' ? 'active' : ''} 
            onClick={() => setTimeframe('7')}
          >
            7D
          </button>
          <button 
            className={timeframe === '30' ? 'active' : ''} 
            onClick={() => setTimeframe('30')}
          >
            1M
          </button>
          <button 
            className={timeframe === '90' ? 'active' : ''} 
            onClick={() => setTimeframe('90')}
          >
            3M
          </button>
          <button 
            className={timeframe === '180' ? 'active' : ''} 
            onClick={() => setTimeframe('180')}
          >
            6M
          </button>
        </div>
      </div>

      <div className="chart-stats">
        <div className="chart-stat">
          <span className="stat-label">Period Change</span>
          <span className={`stat-value ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(priceChangePercent).toFixed(2)}%
          </span>
        </div>
        <div className="chart-stat">
          <span className="stat-label">High</span>
          <span className="stat-value">${maxPrice.toFixed(2)}</span>
        </div>
        <div className="chart-stat">
          <span className="stat-label">Low</span>
          <span className="stat-value">${minPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="chart-svg-container">
        <svg 
          viewBox={`0 0 100 ${height}`} 
          preserveAspectRatio="none"
          className="price-chart-svg"
        >
          {/* Grid lines */}
          <line x1="0" y1={padding} x2="100" y2={padding} stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />
          <line x1="0" y1={height/2} x2="100" y2={height/2} stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />
          <line x1="0" y1={height - padding} x2="100" y2={height - padding} stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.4" />
              <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area under the line */}
          <path
            d={`${pathData} L 100,${height} L 0,${height} Z`}
            fill="url(#chartGradient)"
          />

          {/* Price line */}
          <polyline
            points={points}
            fill="none"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="chart-footer">
        <span className="chart-date">{chartData[0].timestamp.toLocaleDateString()}</span>
        <span className="chart-date">{chartData[chartData.length - 1].timestamp.toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default TechnicalChart;
