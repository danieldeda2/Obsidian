import React, { useState, useEffect } from 'react';
import { getStockQuote } from '../../Services/StockAPI';
import './MarketPulse.css';

// Market index symbols for Finnhub API
// Using ETFs as proxies with multipliers to approximate index values
const INDEX_SYMBOLS = [
  { symbol: 'SPY', displayName: 'S&P 500', multiplier: 10 },        // SPY * 10 ≈ S&P 500
  { symbol: 'QQQ', displayName: 'NASDAQ', multiplier: 32 },         // QQQ * 32 ≈ NASDAQ
  { symbol: 'DIA', displayName: 'DOW', multiplier: 100 },           // DIA * 100 ≈ DOW
  { symbol: 'IWM', displayName: 'RUSSELL 2000', multiplier: 10 },   // IWM * 10 ≈ Russell 2000
  { symbol: 'VXX', displayName: 'VIX', multiplier: 3 },             // VXX * 3 ≈ VIX
];

const MarketPulse = () => {
  const [tickerPosition, setTickerPosition] = useState(0);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch market data using stockApi
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const promises = INDEX_SYMBOLS.map(async (index) => {
          try {
            const quote = await getStockQuote(index.symbol);
            console.log(`Quote for ${index.displayName} (${index.symbol}):`, quote);
            
            if (!quote || quote.price === null || quote.price === undefined) {
              console.warn(`No valid data for ${index.displayName} (${index.symbol})`);
              return null;
            }
            
            // Apply multiplier to approximate actual index value
            const approximateValue = quote.price * index.multiplier;
            const approximateChange = quote.change * index.multiplier;
            
            return {
              symbol: index.displayName,
              value: approximateValue,
              change: quote.changePercent || 0, // Percentage stays the same
              changeValue: approximateChange,
            };
          } catch (err) {
            console.error(`Error fetching ${index.displayName}:`, err);
            return null;
          }
        });

        const results = await Promise.all(promises);
        console.log('All results:', results);
        
        // Filter out null results
        const validResults = results.filter(result => result !== null);
        console.log('Valid results:', validResults);
        
        if (validResults.length > 0) {
          setMarketData(validResults);
          setLoading(false);
          setError(null);
        } else {
          throw new Error('No valid market data received from API');
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMarketData();
    
    // Refresh data every 60 seconds
    const refreshInterval = setInterval(fetchMarketData, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Ticker animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPosition((prev) => (prev <= -50 ? 0 : prev - 0.1));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Display data to render (use marketData if loaded, otherwise show loading state)
  const displayData = marketData.length > 0 ? marketData : INDEX_SYMBOLS.map(idx => ({
    symbol: idx.displayName,
    value: 0,
    change: 0,
    changeValue: 0,
  }));

  return (
    <section className="market-pulse-section">
      <div className="pulse-header">
        <div className="pulse-indicator">
          <span className="pulse-dot"></span>
          <span className="pulse-text">{loading ? 'LOADING' : 'LIVE'}</span>
        </div>
        <h3 className="pulse-title">Market Pulse</h3>
      </div>

      {error ? (
        <div className="pulse-error">
          <p style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>
            Unable to load market data. Please check your API key.
          </p>
        </div>
      ) : (
        <div className="ticker-wrapper">
          <div 
            className="ticker-track"
            style={{ transform: `translateX(${tickerPosition}%)` }}
          >
            {/* Duplicate the indices to create seamless loop */}
            {[...displayData, ...displayData].map((index, i) => (
              <div key={i} className="ticker-item">
                <span className="ticker-symbol">{index.symbol}</span>
                <span className="ticker-value">
                  {loading ? '---' : (index.value ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
                {!loading && index.value !== undefined && (
                  <span className={`ticker-change ${(index.change ?? 0) >= 0 ? 'positive' : 'negative'}`}>
                    {(index.change ?? 0) >= 0 ? '▲' : '▼'} {Math.abs(index.change ?? 0).toFixed(2)}%
                    <span className="ticker-change-value">
                      ({(index.change ?? 0) >= 0 ? '+' : ''}{(index.changeValue ?? 0).toFixed(2)})
                    </span>
                  </span>
                )}
                <span className="ticker-separator">|</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pulse-footer">
        <p className="pulse-disclaimer">
          Market data delayed by 15 minutes • Updated continuously during market hours
        </p>
      </div>
    </section>
  );
};

export default MarketPulse;