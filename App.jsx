import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// 컴포넌트 import
import HomePage from './components/HomePage';
import IntensityInput from './components/IntensityInput';
import Statistics from './components/Statistics';
import Friends from './components/Friends';
import Records from './components/Records';
import Navigation from './components/Navigation';
import ErrorBoundary from './ErrorBoundary';

function App() {
  // 이제 데이터 관리는 각 컴포넌트에서 자체적으로 처리하므로
  // App 컴포넌트의 상태 관리 로직은 제거됩니다.
  // onSave 프롭은 IntensityInput에 여전히 필요할 수 있으므로,
  // 해당 기능이 API와 연동될 때까지 임시로 유지하거나 수정이 필요합니다.
  const handleSave = (record) => {
    // TODO: 이 함수를 API 호출로 변경해야 합니다.
    console.log('Saved record:', record);
    alert('기록 저장은 API 연동 후 구현될 예정입니다.');
  };

  return (
    <Router>
      <div className="mobile-container">
        <ErrorBoundary>
          <Routes>
            <Route
              path="/"
              element={<HomePage />}
            />
            <Route
              path="/input"
              element={<IntensityInput onSave={handleSave} />}
            />
            <Route
              path="/statistics"
              element={<Statistics />}
            />
            <Route
              path="/friends"
              element={<Friends />}
            />
            <Route
              path="/records"
              element={<Records />}
            />
          </Routes>
        </ErrorBoundary>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;

