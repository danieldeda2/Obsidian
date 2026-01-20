import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnalysisDashboard from '../AnalysisDashboard/AnalysisDashboard';

const AnalysisPage = () => {
  const { ticker } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return <AnalysisDashboard ticker={ticker.toUpperCase()} onBack={handleBack} />;
};

export default AnalysisPage;