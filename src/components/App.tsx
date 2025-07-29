'use client';

import React, { Suspense } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { useTokenFromURL } from '@/hooks/useTokenFromURL';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardContent from '@/components/dashboard/DashboardContent';
import HydrationErrorBoundary from '@/components/HydrationErrorBoundary';

const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="px-6 py-4 font-semibold text-sm shadow rounded-md text-white bg-blue-500">
      <div className="flex items-center justify-center">
        <div className="animate-pulse mr-2 text-lg">⏳</div>
        대시보드 로딩 중...
      </div>
    </div>
  </div>
);

// AuthProvider 내부에서 실행되는 컴포넌트
const AppWithAuth = () => {
  // 이제 useAuth에 접근 가능
  useTokenFromURL();
  
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
};

export default function App() {
  return (
    <div suppressHydrationWarning={true}>
      <HydrationErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <AuthProvider>
            <AppWithAuth />
          </AuthProvider>
        </Suspense>
      </HydrationErrorBoundary>
    </div>
  );
}