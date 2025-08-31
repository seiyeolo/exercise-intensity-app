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

function App() {
  const [exerciseRecords, setExerciseRecords] = useState([]);

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedRecords = localStorage.getItem('exerciseRecords');
    if (savedRecords) {
      setExerciseRecords(JSON.parse(savedRecords));
    }
  }, []);

  // 운동 기록 추가 함수
  const addExerciseRecord = (record) => {
    const newRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updatedRecords = [...exerciseRecords, newRecord];
    setExerciseRecords(updatedRecords);
    localStorage.setItem('exerciseRecords', JSON.stringify(updatedRecords));
  };

  // 운동 기록 삭제 함수
  const deleteExerciseRecord = (id) => {
    const updatedRecords = exerciseRecords.filter(record => record.id !== id);
    setExerciseRecords(updatedRecords);
    localStorage.setItem('exerciseRecords', JSON.stringify(updatedRecords));
  };

  return (
    <Router>
      <div className="mobile-container">
        <Routes>
          <Route 
            path="/" 
            element={<HomePage exerciseRecords={exerciseRecords} />} 
          />
          <Route 
            path="/input" 
            element={<IntensityInput onSave={addExerciseRecord} />} 
          />
          <Route 
            path="/statistics" 
            element={<Statistics exerciseRecords={exerciseRecords} />} 
          />
          <Route 
            path="/friends" 
            element={<Friends exerciseRecords={exerciseRecords} />} 
          />
          <Route 
            path="/records" 
            element={<Records exerciseRecords={exerciseRecords} onDelete={deleteExerciseRecord} />} 
          />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;

