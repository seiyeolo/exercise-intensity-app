import React from 'react';
import PropTypes from 'prop-types';

/**
 * 애플리케이션 전체에서 사용되는 재사용 가능한 카드 컴포넌트입니다.
 * 공통적인 스타일(배경, 그림자, 둥근 모서리 등)을 적용합니다.
 * @param {object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 카드 내부에 렌더링될 자식 요소들
 * @param {string} [props.className] - 카드에 추가할 커스텀 CSS 클래스
 * @returns {JSX.Element} Card 컴포넌트의 JSX 엘리먼트
 */
const Card = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
