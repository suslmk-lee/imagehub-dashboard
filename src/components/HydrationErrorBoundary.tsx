'use client';

import React from 'react';

interface HydrationErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface HydrationErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class HydrationErrorBoundary extends React.Component<
  HydrationErrorBoundaryProps,
  HydrationErrorBoundaryState
> {
  constructor(props: HydrationErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): HydrationErrorBoundaryState {
    // Hydration 오류인지 확인
    if (
      error.message.includes('Hydration') ||
      error.message.includes('hydration') ||
      error.message.includes('bis_skin_checked')
    ) {
      // Hydration 오류는 무시하고 정상 렌더링 계속
      console.warn('Hydration error caught and ignored:', error.message);
      return { hasError: false };
    }

    // 다른 오류는 정상 처리
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Hydration 오류가 아닌 경우에만 로그
    if (
      !error.message.includes('Hydration') &&
      !error.message.includes('hydration') &&
      !error.message.includes('bis_skin_checked')
    ) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                문제가 발생했습니다
              </h1>
              <p className="text-gray-600 mb-4">
                페이지를 새로고침해 주세요.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                새로고침
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default HydrationErrorBoundary;