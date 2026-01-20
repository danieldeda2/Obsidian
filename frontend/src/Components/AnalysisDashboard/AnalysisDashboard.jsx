import React, { useState, useEffect } from 'react';
import { getStockQuote, getCompanyOverview } from '../../Services/StockAPI';
import RecommendationGauge from './RecommendationGauge';
import MetricsGrid from './MetricsGrid';
import TechnicalChart from './TechnicalChart';
import RiskMeter from './RiskMeter';
import './AnalysisDashboard.css';

const AnalysisDashboard = ({ ticker, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch stock quote and company overview
      const [quote, overview] = await Promise.all([
        getStockQuote(ticker),
        getCompanyOverview(ticker)
      ]);

      setStockData(quote);
      setCompanyData(overview);

      // Calculate recommendation score (we'll make this more sophisticated later)
      if (quote && overview) {
        const score = calculateRecommendation(quote, overview);
        setRecommendation(score);
      }

      setLoading(false);
    };

    fetchData();
  }, [ticker]);

  const calculateRecommendation = (quote, overview) => {
    let score = 50; // Start at neutral
    
    // Price momentum (30% weight)
    if (quote.changePercent > 2) score += 15;
    else if (quote.changePercent > 0) score += 8;
    else if (quote.changePercent < -2) score -= 15;
    else if (quote.changePercent < 0) score -= 8;

    // PE Ratio analysis (25% weight)
    const pe = parseFloat(overview.peRatio);
    if (pe > 0 && pe < 15) score += 12;
    else if (pe >= 15 && pe < 25) score += 6;
    else if (pe >= 25 && pe < 35) score -= 3;
    else if (pe >= 35) score -= 10;

    // Profit margin (20% weight)
    const profitMargin = parseFloat(overview.profitMargin) * 100;
    if (profitMargin > 20) score += 10;
    else if (profitMargin > 10) score += 5;
    else if (profitMargin < 0) score -= 10;

    // Beta (volatility) - (15% weight)
    const beta = parseFloat(overview.beta);
    if (beta < 1) score += 7;
    else if (beta > 1.5) score -= 7;

    // EPS (10% weight)
    const eps = parseFloat(overview.eps);
    if (eps > 5) score += 5;
    else if (eps > 2) score += 2;
    else if (eps < 0) score -= 5;

    // Cap score between 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Analyzing {ticker}...</p>
      </div>
    );
  }

  if (!stockData || !companyData) {
    return (
      <div className="dashboard-error">
        <h2>Unable to load data for {ticker}</h2>
        <button onClick={onBack} className="back-button">← Back to Search</button>
      </div>
    );
  }

  const getRecommendationLabel = (score) => {
    if (score >= 75) return { text: 'STRONG BUY', class: 'strong-buy' };
    if (score >= 60) return { text: 'BUY', class: 'buy' };
    if (score >= 40) return { text: 'HOLD', class: 'hold' };
    if (score >= 25) return { text: 'SELL', class: 'sell' };
    return { text: 'STRONG SELL', class: 'strong-sell' };
  };

  const recLabel = getRecommendationLabel(recommendation);

  return (
    <div className="analysis-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <div className="stock-header-info">
          <h1 className="stock-ticker">{ticker}</h1>
          <p className="stock-name">{companyData.name}</p>
        </div>
        <div className="stock-price-info">
          <span className="current-price">${stockData.price?.toFixed(2)}</span>
          <span className={`price-change ${stockData.changePercent >= 0 ? 'positive' : 'negative'}`}>
            {stockData.changePercent >= 0 ? '▲' : '▼'} {Math.abs(stockData.changePercent).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Recommendation Gauge - Full Width */}
        <div className="recommendation-section">
          <RecommendationGauge 
            score={recommendation} 
            label={recLabel.text}
            labelClass={recLabel.class}
          />
        </div>

        {/* Metrics Grid */}
        <div className="metrics-section">
          <MetricsGrid 
            stockData={stockData} 
            companyData={companyData} 
          />
        </div>

        {/* Technical Chart */}
        <div className="chart-section">
          <TechnicalChart ticker={ticker} />
        </div>

        {/* Risk Assessment */}
        <div className="risk-section">
          <RiskMeter 
            beta={parseFloat(companyData.beta)}
            volatility={Math.abs(stockData.changePercent)}
          />
        </div>
      </div>

      {/* Company Info */}
      <div className="company-info-section">
        <h3 className="section-title">About {companyData.name}</h3>
        <div className="company-tags">
          <span className="tag">{companyData.sector}</span>
          <span className="tag">{companyData.industry}</span>
        </div>
        <p className="company-description">{companyData.description}</p>
      </div>
    </div>
  );
};

export default AnalysisDashboard;