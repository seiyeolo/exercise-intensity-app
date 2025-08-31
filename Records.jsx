import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, Search, Filter, Trash2, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TEXTS, SETTINGS, API_BASE_URL } from './constants';
import Card from './Card';

/**
 * 운동 기록을 표시하고 관리하는 페이지 컴포넌트입니다.
 * API로부터 운동 기록을 가져와 목록으로 보여주며, 검색 및 필터링 기능을 제공합니다.
 * @returns {JSX.Element} Records 페이지의 JSX 엘리먼트
 */
const Records = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('전체');

  useEffect(() => {
    /**
     * 서버에서 운동 기록 데이터를 비동기적으로 가져옵니다.
     */
    const fetchRecords = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/records`);

        if (!response.ok) {
          throw new Error(`HTTP 에러! 상태: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success') {
          setRecords(result.data);
          setError(null);
        } else {
          throw new Error(result.message || TEXTS.ERROR_LOADING_RECORDS);
        }
      } catch (err) {
        setError(TEXTS.ERROR_LOADING_RECORDS);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, []);

  // 검색어와 필터 타입에 따라 기록을 필터링합니다. useMemo를 사용하여 불필요한 재계산을 방지합니다.
  const filteredRecords = useMemo(() => {
    return records
      .filter(record => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch = (record.exercise_type || '').toLowerCase().includes(lowerSearchTerm) ||
                             (record.memo || '').toLowerCase().includes(lowerSearchTerm);
        const matchesFilter = filterType === '전체' || record.exercise_type === filterType;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [records, searchTerm, filterType]);

  // 운동 종류 목록 (필터용). useMemo로 캐싱합니다.
  const exerciseTypes = useMemo(() => ['전체', ...new Set(records.map(record => record.exercise_type))], [records]);

  /**
   * 특정 ID의 운동 기록을 삭제하는 핸들러입니다.
   * @param {string|number} id - 삭제할 기록의 ID
   */
  const handleDelete = (id) => {
    // TODO: API를 이용한 삭제 기능 구현
    if (window.confirm(TEXTS.DELETE_CONFIRM)) {
      alert('삭제 기능은 곧 구현될 예정입니다.');
    }
  };

  /**
   * 운동 강도에 따라 다른 색상 클래스를 반환합니다.
   * @param {number} intensity - 운동 강도 (0-10)
   * @returns {string} Tailwind CSS 색상 클래스 문자열
   */
  const getIntensityColor = (intensity) => {
    if (intensity <= SETTINGS.INTENSITY_LOW_THRESHOLD) return 'text-green-600 bg-green-100';
    if (intensity <= SETTINGS.INTENSITY_MID_THRESHOLD) return 'text-yellow-600 bg-yellow-100';
    if (intensity <= SETTINGS.INTENSITY_HIGH_THRESHOLD) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-green-400 p-4 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between py-6">
        <button onClick={() => navigate('/')} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">{TEXTS.RECORDS_TITLE}</h1>
        <div className="w-6"></div>
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-4 mb-6">
        <div className="relative mb-4">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={TEXTS.SEARCH_PLACEHOLDER}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

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
      </Card>

      {/* 기록 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-white py-10">
            <p>{TEXTS.LOADING_RECORDS}</p>
          </div>
        ) : error ? (
          <Card className="p-4 bg-red-100 border border-red-400 text-red-700 text-center" role="alert">
            <WifiOff className="mx-auto mb-2" size={32} />
            <strong className="font-bold">{TEXTS.ERROR_GENERAL}</strong>
            <span className="block sm:inline"> {error}</span>
          </Card>
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <Card key={record.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {new Date(record.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
                      })}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {record.time_of_day}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{record.exercise_type}</h3>
                  {record.memo && <p className="text-sm text-gray-600 mb-2">{record.memo}</p>}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">강도:</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getIntensityColor(record.intensity)}`}>
                      {record.intensity}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">{TEXTS.NO_RECORDS_FOUND}</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== '전체' ? TEXTS.CHANGE_SEARCH_CONDITIONS : TEXTS.NO_RECORDS_YET}
            </p>
          </Card>
        )}
      </div>

      {/* 총 기록 수 */}
      {!isLoading && !error && records.length > 0 && (
        <div className="mt-6 text-center">
          <span className="text-white/80 text-sm">
            {TEXTS.TOTAL_RECORDS.replace('{count}', records.length)}
            {filteredRecords.length !== records.length &&
              TEXTS.FILTERED_RECORDS.replace('{count}', filteredRecords.length)}
          </span>
        </div>
      )}
    </div>
  );
};

Records.propTypes = {}; // Records 컴포넌트는 부모로부터 받는 props가 없으므로 비워둡니다.

export default Records;

