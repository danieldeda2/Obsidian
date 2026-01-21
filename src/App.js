import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../src/Components/HomePage/HomePage'
import AnalysisPage from '../src/Components/AnalysisPage/AnalysisPage'
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analysis/:ticker" element={<AnalysisPage />} />
      </Routes>
    </Router>
  );
}

export default App;