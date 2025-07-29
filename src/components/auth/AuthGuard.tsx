'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UnauthorizedPage from './UnauthorizedPage';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="px-6 py-4 font-semibold text-sm shadow rounded-md text-white bg-blue-500">
        <div className="flex items-center justify-center">
          <div className="animate-pulse mr-2 text-lg">⏳</div>
          인증 확인 중...
        </div>
      </div>
    </div>
  </div>
);

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAdmin = false,
  fallback,
  onUnauthorized
}) => {
  const { isAuthenticated, user, loading, error, checkAuthStatus } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsInitialized(true);
    } else {
      setIsInitialized(false);
    }
  }, [loading]);

  const shouldShowError = isInitialized && !loading && (
    !isAuthenticated || 
    (isAuthenticated && requireAdmin && !user?.isAdmin)
  );

  const shouldShowSuccess = isInitialized && !loading && isAuthenticated && 
    (!requireAdmin || user?.isAdmin);

  useEffect(() => {
    if (shouldShowError) {
      onUnauthorized?.();
    }
  }, [shouldShowError, onUnauthorized]);

  // 로딩 중이거나 초기화되지 않은 경우
  if (loading || !isInitialized) {
    return <LoadingSpinner />;
  }

  // 인증되지 않았거나 권한이 없는 경우
  if (shouldShowError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    let errorMessage = '인증이 필요합니다.';
    
    if (error) {
      errorMessage = error;
    } else if (!isAuthenticated) {
      errorMessage = '로그인이 필요합니다.';
    } else if (requireAdmin && !user?.isAdmin) {
      errorMessage = '관리자 권한이 필요합니다.';
    }

    return (
      <UnauthorizedPage
        error={errorMessage}
        onRetry={() => {
          checkAuthStatus();
        }}
        onRedirectToLogin={() => {
          window.location.href = '/login';
        }}
      />
    );
  }

  // 인증 성공 - 자식 컴포넌트 렌더링
  if (shouldShowSuccess) {
    return <>{children}</>;
  }

  // 예상치 못한 상태 - 로딩으로 처리
  return <LoadingSpinner />;
};

export default AuthGuard;