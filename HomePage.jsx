import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Plus, Activity } from 'lucide-react';
import { API_BASE_URL } from './constants';

const HomePage = () => {
  const [records, setRecords] = useState([]);
  
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/records`);
        if (!response.ok) throw new Error('Failed to fetch records');
        const result = await response.json();
        if (result.status === 'success') {
          setRecords(result.data);
        }
      } catch (error) {
        console.error("Error fetching records for homepage:", error);
      }
    };
    fetchRecords();
  }, []);

  const { todayAverage, todayRecordCount, recentRecords } = useMemo(() => {
    const today = new Date().toDateString();
    const todayRecords = records.filter(record =>
      new Date(record.created_at).toDateString() === today
    );

    const avg = todayRecords.length > 0
      ? (todayRecords.reduce((sum, record) => sum + record.intensity, 0) / todayRecords.length).toFixed(1)
      : 0;

    const recent = records
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);

    return {
      todayAverage: avg,
      todayRecordCount: todayRecords.length,
      recentRecords: recent
    };
  }, [records]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-green-400 p-4 pb-20">
      {/* 헤더 */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-white mb-2">운동 강도 측정</h1>
        <div className="text-white/80 text-sm">
          {new Date().toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          })}
        </div>
      </div>

      {/* 오늘의 운동 요약 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">오늘의 운동</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-blue-600">{todayAverage}</div>
            <div className="text-sm text-gray-600">평균 강도</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{todayRecordCount}</div>
            <div className="text-sm text-gray-600">운동 횟수</div>
          </div>
        </div>
      </div>

      {/* 운동 강도 입력 버튼 */}
      <Link to="/input">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full p-8 mb-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <Plus size={32} className="text-green-600" />
            </div>
            <div className="text-white font-semibold text-lg">운동 강도 입력</div>
          </div>
        </div>
      </Link>

      {/* 최근 운동 기록 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Records</h3>
        {recentRecords.length > 0 ? (
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <Activity size={20} className="text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-800">
                      {new Date(record.createdAt).toLocaleDateString('ko-KR', { 
                        month: 'numeric', 
                        day: 'numeric' 
                      })} {record.timeOfDay}
                    </div>
                    <div className="text-sm text-gray-600">{record.exerciseType}</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-blue-600">{record.intensity}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity size={48} className="mx-auto mb-3 text-gray-300" />
            <p>아직 운동 기록이 없습니다.</p>
            <p className="text-sm">첫 운동을 기록해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};

HomePage.propTypes = {};

export default HomePage;

