/**
 * 애플리케이션 전체에서 사용되는 상수 값을 정의합니다.
 */

// API 엔드포인트
export const API_BASE_URL = '/api';

// UI 텍스트
export const TEXTS = {
  // Records.jsx
  RECORDS_TITLE: '운동 기록',
  SEARCH_PLACEHOLDER: '운동 종류나 메모로 검색...',
  NO_RECORDS_FOUND: '기록을 찾을 수 없습니다',
  CHANGE_SEARCH_CONDITIONS: '검색 조건을 변경해보세요.',
  NO_RECORDS_YET: '아직 운동 기록이 없습니다.',
  TOTAL_RECORDS: '총 {count}개의 운동 기록',
  FILTERED_RECORDS: ' ({count}개 표시)',
  DELETE_CONFIRM: '이 운동 기록을 삭제하시겠습니까?',

  // Friends.jsx
  FRIENDS_TITLE: '친구',
  LEADERBOARD_TITLE: '이번 주 리더보드',
  FRIENDS_LIST_TITLE: '친구 목록',

  // 에러 메시지
  ERROR_LOADING_RECORDS: '기록을 불러오는 데 실패했습니다. 네트워크 연결을 확인해주세요.',
  ERROR_LOADING_FRIENDS: '친구 정보를 불러오지 못했습니다. 네트워크 연결을 확인해주세요.',
  ERROR_GENERAL: '오류 발생!',

  // 로딩 메시지
  LOADING_RECORDS: '운동 기록을 불러오는 중...',
  LOADING_LEADERBOARD: '리더보드를 불러오는 중...',
  LOADING_FRIENDS_LIST: '친구 목록을 불러오는 중...',
};

// 매직 넘버 및 설정 값
export const SETTINGS = {
  // Records.jsx - 운동 강도별 색상 임계값
  INTENSITY_LOW_THRESHOLD: 3,
  INTENSITY_MID_THRESHOLD: 6,
  INTENSITY_HIGH_THRESHOLD: 8,

  // Friends.jsx - 임시 사용자 ID
  CURRENT_USER_ID: 1,
};
