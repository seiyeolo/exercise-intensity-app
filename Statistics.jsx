import React, { useState, useMemo } from 'react';
import { ArrowLeft, TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Statistics = ({ exerciseRecords }) => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('주');

  // 통계 데이터 계산
  const statistics = useMemo(() => {
    if (exerciseRecords.length === 0) {
      return {
        averageIntensity: 0,
        maxIntensity: 0,
        totalWorkouts: 0,
        consistency: 0,
        chartData: [],
        timeOfDayData: []
      };
    }

    const totalIntensity = exerciseRecords.reduce((sum, record) => sum + record.intensity, 0);
    const averageIntensity = (totalIntensity / exerciseRecords.length).toFixed(1);
    const maxIntensity = Math.max(...exerciseRecords.map(record => record.intensity));
    const totalWorkouts = exerciseRecords.length;

    // 일관성 점수 계산 (최근 7일 중 운동한 날의 비율)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    const workoutDays = new Set(exerciseRecords.map(record => record.date));
    const consistency = Math.round((last7Days.filter(day => workoutDays.has(day)).length / 7) * 100);

    // 차트 데이터 생성 (최근 7일)
    const chartData = last7Days.reverse().map(date => {
      const dayRecords = exerciseRecords.filter(record => record.date === date);
      const avgIntensity = dayRecords.length > 0 
        ? dayRecords.reduce((sum, record) => sum + record.intensity, 0) / dayRecords.length 
        : 0;
      
      return {
        date: new Date(date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
        intensity: Number(avgIntensity.toFixed(1))
      };
    });

    // 시간대별 운동 빈도 데이터
    const timeOfDayCount = exerciseRecords.reduce((acc, record) => {
      acc[record.timeOfDay] = (acc[record.timeOfDay] || 0) + 1;
      return acc;
    }, {});

    const timeOfDayData = ['오전', '오후', '야간', '틈틈이'].map(time => ({
      time,
      count: timeOfDayCount[time] || 0
    }));

    return {
      averageIntensity,
      maxIntensity,
      totalWorkouts,
      consistency,
      chartData,
      timeOfDayData
    };
  }, [exerciseRecords]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-green-400 p-4 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between py-6">
        <button onClick={() => navigate('/')} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">통계</h1>
        <div className="w-6"></div>
      </div>

      {/* 기간 선택 탭 */}
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1 mb-6">
        <div className="grid grid-cols-4 gap-1">
          {['일', '주', '월', '년'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* 운동 강도 추이 차트 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">운동 강도 추이</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={statistics.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                domain={[0, 10]}
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="intensity" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp size={20} className="text-blue-600" />
            <span className="text-sm text-gray-600">평균 강도</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{statistics.averageIntensity}</div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Target size={20} className="text-green-600" />
            <span className="text-sm text-gray-600">최고 강도</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{statistics.maxIntensity}</div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar size={20} className="text-purple-600" />
            <span className="text-sm text-gray-600">총 운동 횟수</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{statistics.totalWorkouts}</div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Award size={20} className="text-orange-600" />
            <span className="text-sm text-gray-600">꾸준함 점수</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{statistics.consistency}%</div>
        </div>
      </div>

      {/* 시간대별 운동 빈도 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">시간대별 운동 빈도</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statistics.timeOfDayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

