import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트 합니다.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 리포팅 서비스에 에러를 기록할 수 있습니다.
    console.error("ErrorBoundary가 에러를 포착했습니다:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 커스텀 폴백 UI를 렌더링할 수 있습니다.
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 p-4">
          <AlertTriangle size={48} className="mb-4" />
          <h1 className="text-2xl font-bold mb-2">오 이런, 문제가 발생했습니다.</h1>
          <p className="text-center mb-4">
            애플리케이션에 예기치 않은 오류가 발생했습니다. <br/>
            페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            새로고침
          </button>
          <details className="mt-6 text-sm text-gray-600 w-full max-w-lg">
            <summary>에러 상세 정보 보기</summary>
            <pre className="mt-2 p-2 bg-red-100 rounded text-left whitespace-pre-wrap">
              {this.state.error && this.state.error.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
