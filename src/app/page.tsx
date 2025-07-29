'use client';

import dynamic from 'next/dynamic';
import { setupTokenBridge, useTokenFromURL } from '@/hooks/useTokenFromURL';
import { suppressHydrationWarning } from '@/utils/hydrationFix';
import { suppressHydrationErrors } from '@/utils/suppressHydrationErrors';
import { useEffect } from 'react';

// 전체 앱을 동적 로드하여 SSR 완전히 방지
const DynamicApp = dynamic(() => import('@/components/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="px-6 py-4 font-semibold text-sm shadow rounded-md text-white bg-blue-500">
        <div className="flex items-center justify-center">
          <div className="animate-pulse mr-2 text-lg">⏳</div>
          초기화 중...
        </div>
      </div>
    </div>
  )
});

export default function Dashboard() {
  useEffect(() => {
    // 개발 환경에서 hydration 에러 억제
    const errorCleanup = suppressHydrationErrors();
    
    // 토큰 브릿지 설정
    setupTokenBridge();
    
    // Hydration 오류 방지
    const warningCleanup = suppressHydrationWarning();
    
    return () => {
      errorCleanup?.();
      warningCleanup?.();
    };
  }, []);

  return (
    <div suppressHydrationWarning={true}>
      <DynamicApp />
    </div>
  );
}