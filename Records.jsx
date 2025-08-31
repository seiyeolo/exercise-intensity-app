import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Trash2, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Records = ({ exerciseRecords, onDelete }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('전체');

  // 필터링된 기록
  const filteredRecords = exerciseRecords
    .filter(record => {
      const matchesSearch = record.exerciseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.memo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === '전체' || record.exerciseType === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 운동 종류 목록 (필터용)
  const exerciseTypes = ['전체', ...new Set(exerciseRecords.map(record => record.exerciseType))];

  const handleDelete = (id) => {
    if (window.confirm('이 운동 기록을 삭제하시겠습니까?')) {
      onDelete(id);
    }
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
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div key={record.id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 날짜 및 시간대 */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {new Date(record.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {record.timeOfDay}
                    </span>
                  </div>

                  {/* 운동 종류 */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {record.exerciseType}
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
      {exerciseRecords.length > 0 && (
        <div className="mt-6 text-center">
          <span className="text-white/80 text-sm">
            총 {exerciseRecords.length}개의 운동 기록
            {filteredRecords.length !== exerciseRecords.length && 
              ` (${filteredRecords.length}개 표시)`}
          </span>
        </div>
      )}
    </div>
  );
};

export default Records;

