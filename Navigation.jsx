import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FileText, BarChart3, Users, Settings } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center">
        <Link to="/" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
          <Home size={24} />
          <span className="text-xs mt-1">홈</span>
        </Link>
        <Link to="/records" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
          <FileText size={24} />
          <span className="text-xs mt-1">기록</span>
        </Link>
        <Link to="/statistics" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
          <BarChart3 size={24} />
          <span className="text-xs mt-1">통계</span>
        </Link>
        <Link to="/friends" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
          <Users size={24} />
          <span className="text-xs mt-1">친구</span>
        </Link>
        <div className="flex flex-col items-center p-2 text-gray-600">
          <Settings size={24} />
          <span className="text-xs mt-1">설정</span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

