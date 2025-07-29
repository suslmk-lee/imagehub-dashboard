// JWT 토큰 관련 유틸리티 함수들

export interface KeyCloakTokenPayload {
  exp: number; // 만료 시간 (Unix timestamp)
  iat: number; // 발급 시간 (Unix timestamp)
  jti: string; // JWT ID
  iss: string; // 발급자 (KeyCloak URL)
  aud: string[]; // 대상 클라이언트
  sub: string; // 사용자 ID
  typ: string; // 토큰 타입
  azp: string; // 클라이언트 ID
  sid: string; // 세션 ID
  acr: string;
  'allowed-origins': string[];
  realm_access: {
    roles: string[];
  };
  resource_access: {
    [key: string]: {
      roles: string[];
    };
  };
  scope: string;
  email_verified: boolean;
  roles: string[];
  groups: string[];
  preferred_username: string;
}

/**
 * Base64URL 디코딩 함수
 */
function base64UrlDecode(str: string): string {
  // Base64URL을 Base64로 변환
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // 패딩 추가 (Base64는 4의 배수여야 함)
  const padding = base64.length % 4;
  if (padding > 0) {
    base64 += '='.repeat(4 - padding);
  }
  
  return atob(base64);
}

/**
 * JWT 토큰에서 페이로드 추출 (서명 검증 없이)
 */
export function decodeJWT(token: string): KeyCloakTokenPayload | null {
  try {
    // Bearer 접두사 제거
    const cleanToken = token.replace('Bearer ', '').trim();
    
    console.log('🔍 JWT 디코딩 시작:', cleanToken.substring(0, 50) + '...');
    
    // JWT는 점(.)으로 구분된 3부분으로 구성: header.payload.signature
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.error('❌ JWT 형식 오류: 3개 부분이 필요하지만', parts.length, '개 발견');
      throw new Error('Invalid JWT format');
    }

    console.log('🔧 JWT 부분 확인:', {
      header: parts[0].substring(0, 20) + '...',
      payload: parts[1].substring(0, 20) + '...',
      signature: parts[2].substring(0, 20) + '...'
    });

    // Base64URL 디코딩
    const payloadPart = parts[1];
    const decoded = base64UrlDecode(payloadPart);
    
    console.log('✅ 디코딩된 페이로드:', decoded.substring(0, 100) + '...');
    
    const parsedPayload = JSON.parse(decoded) as KeyCloakTokenPayload;
    console.log('🎯 파싱된 페이로드:', {
      sub: parsedPayload.sub,
      preferred_username: parsedPayload.preferred_username,
      exp: parsedPayload.exp,
      roles: parsedPayload.roles
    });
    
    return parsedPayload;
  } catch (error) {
    console.error('💥 JWT 디코딩 실패:', error);
    return null;
  }
}

/**
 * 토큰 만료 여부 확인
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * 토큰에서 사용자 정보 추출
 */
export function getUserFromToken(token: string): {
  username: string;
  roles: string[];
  groups: string[];
  email_verified: boolean;
} | null {
  const payload = decodeJWT(token);
  if (!payload) return null;

  return {
    username: payload.preferred_username,
    roles: payload.roles || [],
    groups: payload.groups || [],
    email_verified: payload.email_verified
  };
}

/**
 * 토큰에서 권한 확인
 */
export function hasRole(token: string, requiredRole: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return false;

  return payload.roles?.includes(requiredRole) || false;
}

/**
 * 관리자 권한 확인
 */
export function isAdmin(token: string): boolean {
  return hasRole(token, 'cp-cluster-admin-role');
}

/**
 * 토큰 유효성 검증 (만료 시간 + 형식)
 */
export function validateToken(token: string): {
  isValid: boolean;
  isExpired: boolean;
  timeUntilExpiry: number; // 초 단위
} {
  try {
    const payload = decodeJWT(token);
    if (!payload) {
      return { isValid: false, isExpired: true, timeUntilExpiry: 0 };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < currentTime;
    const timeUntilExpiry = payload.exp - currentTime;

    return {
      isValid: !isExpired,
      isExpired,
      timeUntilExpiry: Math.max(0, timeUntilExpiry)
    };
  } catch (error) {
    return { isValid: false, isExpired: true, timeUntilExpiry: 0 };
  }
}

/**
 * 토큰 저장 (sessionStorage 사용)
 */
export function saveToken(token: string): void {
  try {
    console.log('💾 saveToken 호출:', token ? `${token.substring(0, 30)}...` : 'null');
    sessionStorage.setItem('accessToken', token);
    
    // 저장 확인
    const saved = sessionStorage.getItem('accessToken');
    console.log('✅ sessionStorage 저장 확인:', saved ? `${saved.substring(0, 30)}...` : 'null');
  } catch (error) {
    console.error('💥 토큰 저장 실패:', error);
  }
}

/**
 * 토큰 조회
 */
export function getToken(): string | null {
  try {
    const token = sessionStorage.getItem('accessToken');
    console.log('🔍 getToken 호출 결과:', token ? `${token.substring(0, 30)}...` : 'null');
    return token;
  } catch (error) {
    console.error('💥 토큰 조회 실패:', error);
    return null;
  }
}

/**
 * 토큰 삭제
 */
export function removeToken(): void {
  try {
    sessionStorage.removeItem('accessToken');
  } catch (error) {
    console.error('토큰 삭제 실패:', error);
  }
}

/**
 * 토큰 포맷팅 (API 요청용)
 */
export function formatTokenForAPI(token: string): string {
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}