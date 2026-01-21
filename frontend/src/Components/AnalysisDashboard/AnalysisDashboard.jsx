import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanyOverview, getStockQuote, getHistoricalData } from '../../Services/StockAPI';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import './AnalysisDashboard.css';

const AnalysisDashboard = () => {
  const { ticker: symbol } = useParams(); // Changed from 'symbol' to 'ticker'
  const navigate = useNavigate();
  const [stockData, setStockData] = useState(null);
  const [quote, setQuote] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('1M'); // New state for time range
  const [chartLoading, setChartLoading] = useState(false); // Separate loading for chart

  // Debug: Log symbol immediately
  console.log('AnalysisDashboard mounted with symbol:', symbol);
  console.log('useParams result:', useParams());

  // Helper function to get days back for each time range
  const getDaysForRange = (range) => {
    switch (range) {
      case '1M': return 30;
      case '6M': return 180;
      case '1Y': return 365;
      case '5Y': return 365*5; // ~10 years
      default: return 30;
    }
  };

  // Fetch chart data based on time range
  useEffect(() => {
    const fetchChartData = async () => {
      if (!symbol) return;

      try {
        setChartLoading(true);
        const days = getDaysForRange(timeRange);
        
        console.log(`Fetching ${days} days of historical data for ${symbol}`);
        const historicalData = await getHistoricalData(symbol, 'D', days);

        console.log('Historical data response:', historicalData);

        if (historicalData && historicalData.length > 0) {
          const formattedData = historicalData.map(item => ({
            date: item.timestamp.toLocaleDateString(),
            price: item.close,
            timestamp: item.timestamp.getTime()
          }));

          setChartData(formattedData);
        } else {
          console.warn('No historical data returned from API');
          setChartData([]);
        }

        setChartLoading(false);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        console.error('Error details:', err.message);
        
        // Check if it's a 403 error
        if (err.message && err.message.includes('403')) {
          console.error('403 Forbidden - likely rate limit or network restriction');
        }
        
        setChartData([]);
        setChartLoading(false);
      }
    };

    if (symbol && !loading) {
      fetchChartData();
    }
  }, [symbol, timeRange, loading]);

  useEffect(() => {
    console.log('useEffect triggered. Symbol:', symbol);
    
    if (!symbol) {
      console.error('No symbol provided in URL params');
      setError('No stock symbol provided');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const timeout = setTimeout(() => {
        console.error('Request timeout after 15 seconds');
        setError('Request timeout - data took too long to load');
        setLoading(false);
      }, 15000);

      try {
        setLoading(true);
        setError(null);

        console.log('Starting API calls for symbol:', symbol);

        // Test if the API functions exist
        console.log('getCompanyOverview function:', typeof getCompanyOverview);
        console.log('getStockQuote function:', typeof getStockQuote);

        // Fetch company overview and quote
        console.log('Calling getCompanyOverview...');
        const overview = await getCompanyOverview(symbol);
        console.log('getCompanyOverview returned:', overview);

        console.log('Calling getStockQuote...');
        const currentQuote = await getStockQuote(symbol);
        console.log('getStockQuote returned:', currentQuote);

        clearTimeout(timeout);

        if (!overview || !currentQuote) {
          throw new Error('Failed to fetch stock data - API returned null');
        }

        setStockData(overview);
        setQuote(currentQuote);

        console.log('Successfully loaded all data, setting loading to false');
        setLoading(false);
      } catch (err) {
        clearTimeout(timeout);
        console.error('Error in fetchData:', err);
        console.error('Error stack:', err.stack);
        setError(err.message || 'Failed to load stock data');
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  // Calculate recommendation score (0-100)
  const getRecommendationScore = () => {
    if (!stockData || !quote) return 50;

    let score = 50;

    // Positive factors
    if (quote.changePercent > 0) score += 10;
    if (stockData.peRatio && stockData.peRatio < 20) score += 10;
    if (stockData.dividendYield && stockData.dividendYield > 2) score += 10;
    if (stockData.profitMargin && stockData.profitMargin > 10) score += 10;

    // Negative factors
    if (quote.changePercent < -2) score -= 15;
    if (stockData.peRatio && stockData.peRatio > 40) score -= 10;
    if (stockData.beta && stockData.beta > 1.5) score -= 5;

    return Math.max(0, Math.min(100, score));
  };

  const recommendationScore = getRecommendationScore();
  const getRecommendationColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getRecommendationText = (score) => {
    if (score >= 70) return 'BUY';
    if (score >= 40) return 'HOLD';
    return 'SELL';
  };

  if (loading) {
    return (
      <div className="analysis-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing {symbol}...</p>
        </div>
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="analysis-dashboard">
        <div className="error-container">
          <h2>Error Loading Data</h2>
          <p>{error || 'Unable to fetch stock data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-dashboard">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/')}>
        <span className="back-arrow">←</span> Back to Home
      </button>

      {/* Header Section */}
      <div className="dashboard-header">
        <div className="stock-title-section">
          <h1 className="stock-symbol">{symbol}</h1>
          <p className="stock-name">{stockData.name}</p>
        </div>
        <div className="price-section">
          <div className="current-price">${quote?.price?.toFixed(2)}</div>
          <div className={`price-change ${quote?.changePercent >= 0 ? 'positive' : 'negative'}`}>
            {quote?.changePercent >= 0 ? '▲' : '▼'} {Math.abs(quote?.changePercent || 0).toFixed(2)}%
            <span className="change-value">
              ({quote?.changePercent >= 0 ? '+' : ''}${quote?.change?.toFixed(2)})
            </span>
          </div>
        </div>
      </div>

      {/* AI Recommendation Gauge */}
      <div className="recommendation-section">
        <h2 className="section-title">AI Recommendation</h2>
        <div className="recommendation-gauge">
          <div className="gauge-container">
            <svg viewBox="0 0 200 120" className="gauge-svg">
              {/* Background arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="20"
                strokeLinecap="round"
              />
              {/* Colored arc based on score */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={getRecommendationColor(recommendationScore)}
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${(recommendationScore / 100) * 251.2} 251.2`}
                className="gauge-progress"
              />
              {/* Needle */}
              <line
                x1="100"
                y1="100"
                x2={100 + 60 * Math.cos((Math.PI * recommendationScore) / 100 + Math.PI)}
                y2={100 + 60 * Math.sin((Math.PI * recommendationScore) / 100 + Math.PI)}
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="8" fill="#fff" />
            </svg>
            <div className="gauge-labels">
              <span className="gauge-label-left">SELL</span>
              <span className="gauge-label-center">{recommendationScore}</span>
              <span className="gauge-label-right">BUY</span>
            </div>
          </div>
          <div className="recommendation-result">
            <div 
              className="recommendation-badge"
              style={{ 
                backgroundColor: `${getRecommendationColor(recommendationScore)}20`,
                borderColor: getRecommendationColor(recommendationScore)
              }}
            >
              {getRecommendationText(recommendationScore)}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h2 className="section-title">Price History</h2>
          <div className="time-range-selector">
            <button 
              className={`time-btn ${timeRange === '1M' ? 'active' : ''}`}
              onClick={() => setTimeRange('1M')}
            >
              1M
            </button>
            <button 
              className={`time-btn ${timeRange === '6M' ? 'active' : ''}`}
              onClick={() => setTimeRange('6M')}
            >
              6M
            </button>
            <button 
              className={`time-btn ${timeRange === '1Y' ? 'active' : ''}`}
              onClick={() => setTimeRange('1Y')}
            >
              1Y
            </button>
            <button 
              className={`time-btn ${timeRange === '5Y' ? 'active' : ''}`}
              onClick={() => setTimeRange('5Y')}
            >
              5Y
            </button>
          </div>
        </div>
        {chartLoading ? (
          <div className="chart-loading">
            <div className="loading-spinner"></div>
            <p>Loading chart data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart 
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                labelFormatter={(label) => `Date: ${label}`}
                cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }}
                wrapperStyle={{ outline: 'none' }}
                allowEscapeViewBox={{ x: false, y: false }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                fill="url(#colorPrice)"
                activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-unavailable">
            <p>📊 Chart data unavailable</p>
            <p className="unavailable-subtitle">
              Unable to fetch historical price data. This may be due to API rate limits or network restrictions.
            </p>
            <p className="unavailable-subtitle" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
              Try again in a few moments or contact support if the issue persists.
            </p>
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Market Cap</div>
          <div className="metric-value">
            {stockData.marketCap !== 'N/A' 
              ? `$${(stockData.marketCap / 1000).toFixed(2)}B` 
              : 'N/A'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">P/E Ratio</div>
          <div className="metric-value">
            {stockData.peRatio !== 'N/A' ? stockData.peRatio.toFixed(2) : 'N/A'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">EPS</div>
          <div className="metric-value">
            {stockData.eps !== 'N/A' ? `$${stockData.eps.toFixed(2)}` : 'N/A'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Dividend Yield</div>
          <div className="metric-value">
            {stockData.dividendYield !== 'N/A' 
              ? `${stockData.dividendYield.toFixed(2)}%` 
              : 'N/A'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Profit Margin</div>
          <div className="metric-value">
            {stockData.profitMargin !== 'N/A' 
              ? `${stockData.profitMargin.toFixed(2)}%` 
              : 'N/A'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Beta</div>
          <div className="metric-value">
            {stockData.beta !== 'N/A' ? stockData.beta.toFixed(2) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="company-info-section">
        <h2 className="section-title">Company Information</h2>
        <div className="company-info-grid">
          <div className="info-item">
            <span className="info-label">Sector:</span>
            <span className="info-value">{stockData.sector}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Industry:</span>
            <span className="info-value">{stockData.industry}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Exchange:</span>
            <span className="info-value">{stockData.exchange}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Country:</span>
            <span className="info-value">{stockData.country}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;