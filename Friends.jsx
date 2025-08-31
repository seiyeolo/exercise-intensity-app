import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, UserPlus, Trophy, Users, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TEXTS, SETTINGS, API_BASE_URL } from './constants';
import Card from './Card';

/**
 * 친구 관련 정보(리더보드, 친구 목록)를 표시하는 페이지 컴포넌트입니다.
 * @returns {JSX.Element} Friends 페이지의 JSX 엘리먼트
 */
const Friends = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * 친구 목록과 리더보드 데이터를 서버로부터 비동기적으로 가져옵니다.
     */
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [friendsResponse, leaderboardResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/friends/${SETTINGS.CURRENT_USER_ID}`),
          fetch(`${API_BASE_URL}/friends/leaderboard/${SETTINGS.CURRENT_USER_ID}`)
        ]);

        if (!friendsResponse.ok || !leaderboardResponse.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }

        const friendsResult = await friendsResponse.json();
        const leaderboardResult = await leaderboardResponse.json();

        if (friendsResult.status === 'success' && leaderboardResult.status === 'success') {
          setFriends(friendsResult.data.friends || []);
          setLeaderboard(leaderboardResult.data.leaderboard || []);
          setError(null);
        } else {
          throw new Error(friendsResult.message || leaderboardResult.message || TEXTS.ERROR_LOADING_FRIENDS);
        }
      } catch (err) {
        setError(TEXTS.ERROR_LOADING_FRIENDS);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * 사용자의 순위에 따라 다른 스타일의 뱃지를 반환합니다.
   * @param {number} rank - 사용자의 순위
   * @returns {string} Tailwind CSS 클래스 문자열
   */
  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'bg-yellow-400 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-orange-400 text-white';
    return 'bg-gray-200 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-green-400 p-4 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between py-6">
        <button onClick={() => navigate('/')} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">{TEXTS.FRIENDS_TITLE}</h1>
        <button className="text-white">
          <UserPlus size={24} />
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && !isLoading && (
        <Card className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 text-center" role="alert">
          <WifiOff className="mx-auto mb-2" size={32} />
          <strong className="font-bold">{TEXTS.ERROR_GENERAL}</strong>
          <span className="block sm:inline"> {error}</span>
        </Card>
      )}

      {/* 리더보드 */}
      <Card className="p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy size={24} className="text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-800">{TEXTS.LEADERBOARD_TITLE}</h2>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-gray-500">{TEXTS.LOADING_LEADERBOARD}</p>
          ) : leaderboard.length > 0 ? (
            leaderboard.map((item) => (
              <div
                key={item.user_id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  item.is_current_user ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeClass(item.rank)}`}>
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
      </Card>

      {/* 친구 목록 */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users size={24} className="text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-800">{TEXTS.FRIENDS_LIST_TITLE}</h2>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-gray-500">{TEXTS.LOADING_FRIENDS_LIST}</p>
          ) : friends.length > 0 ? (
            friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
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
      </Card>
    </div>
  );
};

Friends.propTypes = {}; // Friends 컴포넌트는 부모로부터 받는 props가 없으므로 비워둡니다.

export default Friends;

