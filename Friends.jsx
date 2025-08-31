import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Trophy, TrendingUp, Users, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Friends = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 임시 사용자 ID. 실제 앱에서는 인증된 사용자 ID를 사용해야 합니다.
  const currentUserId = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // 친구 목록과 리더보드 데이터를 병렬로 가져옵니다.
        const [friendsResponse, leaderboardResponse] = await Promise.all([
          fetch(`/api/friends/${currentUserId}`),
          fetch(`/api/friends/leaderboard/${currentUserId}`)
        ]);

        if (!friendsResponse.ok || !leaderboardResponse.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }

        const friendsData = await friendsResponse.json();
        const leaderboardData = await leaderboardResponse.json();

        setFriends(friendsData.friends || []);
        setLeaderboard(leaderboardData.leaderboard || []);
        setError(null);
      } catch (err) {
        setError("친구 정보를 불러오지 못했습니다. 네트워크 연결을 확인해주세요.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUserId]);

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

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center mb-6" role="alert">
          <WifiOff className="mx-auto mb-2" size={32} />
          <strong className="font-bold">오류 발생!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* 리더보드 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy size={24} className="text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-800">이번 주 리더보드</h2>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-gray-500">리더보드를 불러오는 중...</p>
          ) : leaderboard.length > 0 ? (
            leaderboard.map((item) => (
              <div
                key={item.user_id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  item.is_current_user ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    item.rank === 1 ? 'bg-yellow-400 text-white' :
                    item.rank === 2 ? 'bg-gray-400 text-white' :
                    item.rank === 3 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {item.rank}
                  </div>
                  <div>
                    <div className={`font-medium ${item.is_current_user ? 'text-blue-800' : 'text-gray-800'}`}>
                      {item.username} {item.is_current_user && '(나)'}
                    </div>
                  </div>
                </div>
                <div className={`text-lg font-bold ${item.is_current_user ? 'text-blue-600' : 'text-gray-600'}`}>
                  {item.weekly_score}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">리더보드 정보가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 친구 목록 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Users size={24} className="text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-800">친구 목록</h2>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-gray-500">친구 목록을 불러오는 중...</p>
          ) : friends.length > 0 ? (
            friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                      {/* 아바타는 임시로 첫 글자로 대체 */}
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    {/* 온라인 상태는 현재 API에 없으므로 임의로 표시 */}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      Math.random() > 0.5 ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{friend.username}</div>
                    <div className="text-sm text-gray-600">이번 주 점수: {friend.weekly_score}</div>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  비교하기
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">친구 정보가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;

