import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

const IntensityInput = ({ onSave }) => {
  const navigate = useNavigate();
  const [intensity, setIntensity] = useState(5);
  const [timeOfDay, setTimeOfDay] = useState('오전');
  const [exerciseType, setExerciseType] = useState('');
  const [memo, setMemo] = useState('');

  const handleSave = () => {
    if (!exerciseType.trim()) {
      alert('운동 종류를 입력해주세요.');
      return;
    }

    const record = {
      intensity: parseInt(intensity),
      timeOfDay,
      exerciseType: exerciseType.trim(),
      memo: memo.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    onSave(record);
    navigate('/');
  };

  const intensityDescriptions = {
    0: '아무것도 하지 않는',
    1: '매우 약하게',
    2: '약하게', 
    3: '적당히',
    4: '',
    5: '강하게',
    6: '',
    7: '매우 강하게',
    8: '',
    9: '거의 최대',
    10: '최대'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-green-400 p-4 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between py-6">
        <button onClick={() => navigate('/')} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">운동 강도 입력</h1>
        <div className="w-6"></div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        {/* 운동 강도 선택 */}
        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">운동 강도를 선택하세요</h2>
          
          {/* 강도 원형 표시 */}
          <div className="relative mx-auto mb-6" style={{ width: '200px', height: '200px' }}>
            <div className="intensity-circle">
              <div className="intensity-value">{intensity}</div>
            </div>
            {/* 강도 숫자들 */}
            {[...Array(11)].map((_, i) => {
              const angle = (i * 36) - 90; // 0부터 10까지, -90도에서 시작
              const radian = (angle * Math.PI) / 180;
              const x = 100 + 80 * Math.cos(radian);
              const y = 100 + 80 * Math.sin(radian);
              
              return (
                <div
                  key={i}
                  className={`absolute text-sm font-medium ${
                    i === intensity ? 'text-blue-600 font-bold' : 'text-gray-400'
                  }`}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {i}
                </div>
              );
            })}
          </div>

          {/* 슬라이더 */}
          <input
            type="range"
            min="0"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-4"
            style={{
              background: `linear-gradient(to right, #34d399 0%, #60a5fa 100%)`
            }}
          />
          
          {/* 강도 설명 */}
          <div className="text-sm text-gray-600 min-h-[20px]">
            {intensityDescriptions[intensity]}
          </div>
        </div>

        {/* 시간대 선택 */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">시간대</h3>
          <div className="grid grid-cols-4 gap-2">
            {['오전', '오후', '야간', '틈틈이'].map((time) => (
              <button
                key={time}
                onClick={() => setTimeOfDay(time)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  timeOfDay === time
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* 운동 종류 */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">운동 종류</h3>
          <select
            value={exerciseType}
            onChange={(e) => setExerciseType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">운동 종류 선택</option>
            <option value="달리기">달리기</option>
            <option value="걷기">걷기</option>
            <option value="자전거">자전거</option>
            <option value="수영">수영</option>
            <option value="웨이트 트레이닝">웨이트 트레이닝</option>
            <option value="요가">요가</option>
            <option value="필라테스">필라테스</option>
            <option value="축구">축구</option>
            <option value="농구">농구</option>
            <option value="테니스">테니스</option>
            <option value="기타">기타</option>
          </select>
        </div>

        {/* 메모 */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-3">메모</h3>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="운동에 대한 간단한 메모를 입력하세요..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
          />
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 hover:shadow-lg transition-shadow"
        >
          <Save size={20} />
          <span>저장</span>
        </button>
      </div>
    </div>
  );
};

IntensityInput.propTypes = {
  onSave: PropTypes.func.isRequired,
};

export default IntensityInput;

