import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../HeroSection/HeroSection';
import FeatureCards from '../FeatureCards/FeatureCards';
import MarketPulse from '../MarketPulse/MarketPulse';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStockSearch = (ticker) => {
    // Navigate to analysis page with ticker
    navigate(`/analysis/${ticker}`);
  };

  return (
    <div className="homepage">
      <HeroSection onSearch={handleStockSearch} />
      <FeatureCards />
      <MarketPulse />
    </div>
  );
};

export default HomePage;