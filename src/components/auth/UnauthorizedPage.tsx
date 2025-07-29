'use client';

import React from 'react';
import Card from '@/components/ui/Card';

interface UnauthorizedPageProps {
  error?: string;
  onRetry?: () => void;
  onRedirectToLogin?: () => void;
}

const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  error = '인증이 필요합니다.',
  onRetry,
  onRedirectToLogin
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center">
            {/* 401 아이콘 */}
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg 
                className="w-8 h-8 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>

            {/* 에러 제목 */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              접근이 거부되었습니다
            </h1>

            {/* 에러 메시지 */}
            <p className="text-gray-600 mb-6">
              {error}
            </p>

            {/* 상태 코드 */}
            <div className="bg-gray-100 rounded-lg p-3 mb-6">
              <span className="text-sm font-mono text-gray-500">HTTP 401 Unauthorized</span>
            </div>

            {/* 액션 버튼들 */}
            <div className="space-y-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>다시 시도</span>
                </button>
              )}

              {onRedirectToLogin && (
                <button
                  onClick={onRedirectToLogin}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>로그인하기</span>
                </button>
              )}

              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                이전 페이지로 돌아가기
              </button>
            </div>

            {/* 추가 정보 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                문제가 지속되면 시스템 관리자에게 문의하세요.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UnauthorizedPage;