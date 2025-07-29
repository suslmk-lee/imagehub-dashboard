'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * URL 파라미터나 postMessage를 통해 토큰을 받는 커스텀 훅
 * 기존 UI에서 대시보드로 토큰을 전달할 때 사용
 */
export const useTokenFromURL = () => {
  const { setTokenFromExternal, checkAuthStatus } = useAuth();

  useEffect(() => {
    let hasProcessedToken = false;
    
    console.log('🌐 useTokenFromURL 실행 시작');
    console.log('🔗 현재 URL:', window.location.href);
    
    // 1. URL 파라미터에서 토큰 확인
    const urlParams = new URLSearchParams(window.location.search);
    console.log('📋 모든 URL 파라미터:', Array.from(urlParams.entries()));
    
    const tokenFromURL = urlParams.get('token');
    console.log('🔑 URL에서 추출된 토큰:', tokenFromURL ? `${tokenFromURL.substring(0, 30)}...` : 'null');
    
    if (tokenFromURL && !hasProcessedToken) {
      hasProcessedToken = true;
      console.log('URL에서 토큰 감지:', tokenFromURL.substring(0, 20) + '...');
      setTokenFromExternal(tokenFromURL);
      
      // URL에서 토큰 파라미터 제거 (보안상)
      const newURL = new URL(window.location.href);
      newURL.searchParams.delete('token');
      window.history.replaceState({}, '', newURL.toString());
      return;
    }

    // 2. PostMessage를 통한 토큰 수신 (기존 UI가 iframe으로 대시보드를 로드하는 경우)
    const handleMessage = (event: MessageEvent) => {
      if (hasProcessedToken) return;
      
      // 보안: origin 검증 (실제 운영 시에는 허용된 origin만 허용)
      const allowedOrigins = [
        'https://registry-dev.k-paas.org',
        'https://portal.133.186.152.47.nip.io',
        'https://hub.133.186.152.47.nip.io',
        window.location.origin // 같은 도메인
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.warn('허용되지 않은 origin에서 메시지:', event.origin);
        return;
      }

      if (event.data && event.data.type === 'KEYCLOAK_TOKEN') {
        hasProcessedToken = true;
        console.log('PostMessage로 토큰 수신');
        setTokenFromExternal(event.data.token);
        
        // 부모 창에 로딩 완료 알림
        if (event.source) {
          (event.source as Window).postMessage({ 
            type: 'DASHBOARD_READY',
            success: true 
          }, event.origin);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // 3. 로컬 스토리지에서 토큰 확인 (기존 UI와 같은 도메인인 경우)
    const checkLocalStorage = () => {
      if (hasProcessedToken) return;
      
      console.log('💾 로컬 스토리지 토큰 확인 시작');
      
      try {
        // 기존 UI에서 사용하는 키클락 토큰 키 확인
        const possibleKeys = [
          'accessToken',
          'keycloak-token',
          'access_token',
          'auth_token',
          'kc_token'
        ];
        
        for (const key of possibleKeys) {
          const localToken = localStorage.getItem(key);
          const sessionToken = sessionStorage.getItem(key);
          
          console.log(`📋 ${key} 확인:`, {
            localStorage: localToken ? `${localToken.substring(0, 15)}...` : 'null',
            sessionStorage: sessionToken ? `${sessionToken.substring(0, 15)}...` : 'null'
          });
          
          const token = localToken || sessionToken;
          if (token && !hasProcessedToken) {
            hasProcessedToken = true;
            console.log(`✨ ${key}에서 토큰 발견, setTokenFromExternal 호출`);
            setTokenFromExternal(token);
            return;
          }
        }
        console.log('💾 모든 스토리지에서 토큰을 찾을 수 없음');
      } catch (error) {
        console.error('로컬 스토리지 토큰 확인 실패:', error);
      }
    };

    // 토큰이 URL에 없으면 로컬 스토리지 확인
    if (!tokenFromURL) {
      checkLocalStorage();
    }

    // 4. 부모 창에 토큰 요청 (iframe으로 로드된 경우)
    if (window.parent !== window && !hasProcessedToken) {
      console.log('iframe에서 실행 중 - 부모 창에 토큰 요청');
      window.parent.postMessage({
        type: 'REQUEST_KEYCLOAK_TOKEN',
        origin: window.location.origin
      }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []); // setTokenFromExternal 의존성 제거로 무한 렌더링 방지

  // 주기적으로 인증 상태 확인 (토큰이 외부에서 갱신될 수 있음)
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 30000); // 30초마다 확인

    return () => clearInterval(interval);
  }, []); // checkAuthStatus 의존성 제거로 무한 렌더링 방지
};

/**
 * 기존 UI에서 사용할 수 있는 대시보드 토큰 전달 함수들
 * 기존 UI의 JavaScript에서 직접 호출할 수 있도록 window 객체에 등록
 */
export const setupTokenBridge = () => {
  if (typeof window === 'undefined') return;

  // 전역 함수로 등록하여 기존 UI에서 호출 가능하게 함
  (window as any).ImageHubDashboard = {
    /**
     * 기존 UI에서 토큰을 대시보드에 전달
     */
    setToken: (token: string) => {
      console.log('외부에서 토큰 설정 요청');
      
      // PostMessage로 전달 (iframe인 경우)
      if (window.parent !== window) {
        window.postMessage({
          type: 'KEYCLOAK_TOKEN',
          token: token
        }, window.location.origin);
      }
      
      // 직접 sessionStorage에 저장 (같은 도메인인 경우)
      try {
        sessionStorage.setItem('accessToken', token);
        window.dispatchEvent(new CustomEvent('tokenUpdated', { detail: { token } }));
      } catch (error) {
        console.error('토큰 저장 실패:', error);
      }
    },

    /**
     * 대시보드 준비 상태 확인
     */
    isReady: () => {
      return document.readyState === 'complete';
    },

    /**
     * 대시보드에서 현재 인증 상태 조회
     */
    getAuthStatus: () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        return {
          hasToken: !!token,
          isReady: document.readyState === 'complete'
        };
      } catch {
        return { hasToken: false, isReady: false };
      }
    }
  };

  console.log('ImageHub Dashboard Token Bridge 초기화 완료');
};