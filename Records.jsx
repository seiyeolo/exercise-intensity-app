import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Trash2, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Records = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('전체');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/records');

        if (!response.ok) {
          throw new Error(`HTTP 에러! 상태: ${response.status}`);
        }

        const data = await response.json();
        setRecords(data);
        setError(null);
      } catch (err) {
        setError("기록을 불러오는 데 실패했습니다. 네트워크 연결을 확인해주세요.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, []);

  // 필터링된 기록
  const filteredRecords = records
    .filter(record => {
      const matchesSearch = (record.exercise_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (record.memo || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === '전체' || record.exercise_type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // 운동 종류 목록 (필터용)
  const exerciseTypes = ['전체', ...new Set(records.map(record => record.exercise_type))];

  const handleDelete = (id) => {
    // TODO: API를 이용한 삭제 기능 구현
    alert('삭제 기능은 곧 구현될 예정입니다.');
  };

  const getIntensityColor = (intensity) => {
    if (intensity <= 3) return 'text-green-600 bg-green-100';
    if (intensity <= 6) return 'text-yellow-600 bg-yellow-100';
    if (intensity <= 8) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-green-400 p-4 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between py-6">
        <button onClick={() => navigate('/')} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">운동 기록</h1>
        <div className="w-6"></div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-lg">
        {/* 검색 */}
        <div className="relative mb-4">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="운동 종류나 메모로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 필터 */}
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-600" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {exerciseTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 기록 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-white py-10">
            <p>운동 기록을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center" role="alert">
            <WifiOff className="mx-auto mb-2" size={32} />
            <strong className="font-bold">오류 발생!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div key={record.id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 날짜 및 시간대 */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {new Date(record.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {record.time_of_day}
                    </span>
                  </div>

                  {/* 운동 종류 */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {record.exercise_type}
                  </h3>

                  {/* 메모 */}
                  {record.memo && (
                    <p className="text-sm text-gray-600 mb-2">{record.memo}</p>
                  )}

                  {/* 운동 강도 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">강도:</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getIntensityColor(record.intensity)}`}>
                      {record.intensity}
                    </span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">기록을 찾을 수 없습니다</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== '전체' 
                ? '검색 조건을 변경해보세요.' 
                : '아직 운동 기록이 없습니다.'}
            </p>
          </div>
        )}
      </div>

      {/* 총 기록 수 */}
      {!isLoading && !error && records.length > 0 && (
        <div className="mt-6 text-center">
          <span className="text-white/80 text-sm">
            총 {records.length}개의 운동 기록
            {filteredRecords.length !== records.length &&
              ` (${filteredRecords.length}개 표시)`}
          </span>
        </div>
      )}
    </div>
  );
};

export default Records;

