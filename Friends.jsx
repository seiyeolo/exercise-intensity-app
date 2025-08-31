import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Trophy, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Friends = ({ exerciseRecords }) => {
  const navigate = useNavigate();
  const [selectedFriend, setSelectedFriend] = useState(null);

  // 모의 친구 데이터 (실제 앱에서는 서버에서 가져옴)
  const mockFriends = [
    { id: 1, name: 'Kim Yuna', avatar: '👩', weeklyScore: 18, status: 'online' },
    { id: 2, name: 'Sarah', avatar: '👩‍🦰', weeklyScore: 14, status: 'offline' },
    { id: 3, name: 'Park Jiho', avatar: '👨', weeklyScore: 12, status: 'online' },
    { id: 4, name: 'Choi Minjun', avatar: '👨‍💼', weeklyScore: 10, status: 'offline' }
  ];

  // 사용자의 주간 점수 계산
  const userWeeklyScore = exerciseRecords
    .filter(record => {
      const recordDate = new Date(record.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return recordDate >= weekAgo;
    })
    .reduce((sum, record) => sum + record.intensity, 0);

  // 리더보드 데이터 (사용자 포함)
  const leaderboard = [
    { name: 'You', score: userWeeklyScore, isUser: true },
    ...mockFriends.map(friend => ({ name: friend.name, score: friend.weeklyScore, isUser: false }))
  ].sort((a, b) => b.score - a.score);

  // 친구 비교 차트 데이터 (모의 데이터)
  const comparisonData = [
    { day: '월', user: 5, friend: 4 },
    { day: '화', user: 7, friend: 6 },
    { day: '수', user: 6, friend: 8 },
    { day: '목', user: 8, friend: 7 },
    { day: '금', user: 9, friend: 6 },
    { day: '토', user: 7, friend: 9 },
    { day: '일', user: 6, friend: 8 }
  ];

  // 모의 도전 과제
  const challenges = [
    { id: 1, title: '이번 주 5회 운동하기', progress: 60, target: 5, current: 3 },
    { id: 2, title: '평균 강도 7 이상 유지', progress: 85, target: 7, current: 6.8 },
    { id: 3, title: '친구와 함께 운동하기', progress: 30, target: 3, current: 1 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-green-400 p-4 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between py-6">
        <button onClick={() => navigate('/')} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">친구</h1>
        <button className="text-white">
          <UserPlus size={24} />
        </button>
      </div>

      {/* 리더보드 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy size={24} className="text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-800">이번 주 리더보드</h2>
        </div>
        
        <div className="space-y-3">
          {leaderboard.map((item, index) => (
            <div 
              key={item.name}
              className={`flex items-center justify-between p-3 rounded-lg ${
                item.isUser ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-400 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className={`font-medium ${item.isUser ? 'text-blue-800' : 'text-gray-800'}`}>
                    {item.name} {item.isUser && '(나)'}
                  </div>
                </div>
              </div>
              <div className={`text-lg font-bold ${item.isUser ? 'text-blue-600' : 'text-gray-600'}`}>
                {item.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 친구 비교 차트 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp size={24} className="text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">친구 비교</h2>
        </div>
        
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="#6b7280" fontSize={12} />
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
                dataKey="user" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="나"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="friend" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Sarah"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">나</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Sarah</span>
          </div>
        </div>
      </div>

      {/* 도전 과제 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy size={24} className="text-green-500" />
          <h2 className="text-lg font-semibold text-gray-800">도전 과제</h2>
        </div>
        
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800">{challenge.title}</h3>
                <span className="text-sm text-gray-600">{challenge.progress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${challenge.progress}%` }}
                ></div>
              </div>
              
              <div className="text-sm text-gray-600">
                {challenge.current} / {challenge.target}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 친구 목록 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Users size={24} className="text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-800">친구 목록</h2>
        </div>
        
        <div className="space-y-3">
          {mockFriends.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                    {friend.avatar}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    friend.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">{friend.name}</div>
                  <div className="text-sm text-gray-600">이번 주 점수: {friend.weeklyScore}</div>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                비교하기
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Friends;

