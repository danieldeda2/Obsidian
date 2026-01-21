import React from 'react';
import './MetricsGrid.css';

const MetricsGrid = ({ stockData, companyData }) => {
  const metrics = [
    {
      label: 'Market Cap',
      value: companyData.marketCap !== 'N/A' 
        ? `$${(companyData.marketCap / 1000).toFixed(2)}B` 
        : 'N/A',
      icon: '💰',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    },
    {
      label: 'P/E Ratio',
      value: companyData.peRatio !== 'N/A' 
        ? parseFloat(companyData.peRatio).toFixed(2) 
        : 'N/A',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
      label: 'EPS',
      value: companyData.eps !== 'N/A' 
        ? `$${parseFloat(companyData.eps).toFixed(2)}` 
        : 'N/A',
      icon: '💵',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      label: 'Beta',
      value: companyData.beta !== 'N/A' 
        ? parseFloat(companyData.beta).toFixed(2) 
        : 'N/A',
      icon: '📈',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    {
      label: 'Day High',
      value: stockData.high ? `$${stockData.high.toFixed(2)}` : 'N/A',
      icon: '⬆️',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      label: 'Day Low',
      value: stockData.low ? `$${stockData.low.toFixed(2)}` : 'N/A',
      icon: '⬇️',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
    },
    {
      label: 'Open Price',
      value: stockData.open ? `$${stockData.open.toFixed(2)}` : 'N/A',
      icon: '🔓',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
    },
    {
      label: 'Prev Close',
      value: stockData.previousClose ? `$${stockData.previousClose.toFixed(2)}` : 'N/A',
      icon: '🔒',
      gradient: 'linear-gradient(135deg, #64748b, #475569)'
    },
    {
      label: 'Profit Margin',
      value: companyData.profitMargin !== 'N/A' 
        ? `${(parseFloat(companyData.profitMargin) * 100).toFixed(2)}%` 
        : 'N/A',
      icon: '💹',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
      label: 'Dividend Yield',
      value: companyData.dividendYield !== 'N/A' 
        ? `${parseFloat(companyData.dividendYield).toFixed(2)}%` 
        : 'N/A',
      icon: '💎',
      gradient: 'linear-gradient(135deg, #ec4899, #db2777)'
    }
  ];

  return (
    <div className="metrics-grid-container">
      <h3 className="metrics-title">Key Metrics</h3>
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="metric-card"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="metric-icon-wrapper" style={{ background: metric.gradient }}>
              <span className="metric-icon">{metric.icon}</span>
            </div>
            <div className="metric-content">
              <span className="metric-label">{metric.label}</span>
              <span className="metric-value">{metric.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsGrid;
