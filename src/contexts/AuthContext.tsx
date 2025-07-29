'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  validateToken, 
  getUserFromToken, 
  saveToken, 
  getToken, 
  removeToken,
  isAdmin
} from '@/utils/tokenUtils';

interface User {
  username: string;
  roles: string[];
  groups: string[];
  email_verified: boolean;
  isAdmin: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => void;
  clearError: () => void;
  setTokenFromExternal: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
    loading: true, // 초기에는 토큰 검증 중
    error: null
  });

  /**
   * 토큰 검증 및 사용자 정보 추출
   */
  const validateAndSetUser = (token: string): boolean => {
    try {
      const validation = validateToken(token);
      
      if (!validation.isValid) {
        if (validation.isExpired) {
          setState(prev => ({ 
            ...prev, 
            error: '토큰이 만료되었습니다. 다시 로그인해주세요.',
            isAuthenticated: false,
            token: null,
            user: null,
            loading: false
          }));
        } else {
          setState(prev => ({ 
            ...prev, 
            error: '유효하지 않은 토큰입니다.',
            isAuthenticated: false,
            token: null,
            user: null,
            loading: false
          }));
        }
        return false;
      }

      const userInfo = getUserFromToken(token);
      if (!userInfo) {
        setState(prev => ({ 
          ...prev, 
          error: '사용자 정보를 추출할 수 없습니다.',
          isAuthenticated: false,
          token: null,
          user: null,
          loading: false
        }));
        return false;
      }

      const user: User = {
        ...userInfo,
        isAdmin: isAdmin(token)
      };

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        token,
        user,
        error: null,
        loading: false
      }));

      return true;
    } catch (error) {
      console.error('토큰 검증 중 오류:', error);
      setState(prev => ({ 
        ...prev, 
        error: '인증 처리 중 오류가 발생했습니다.',
        isAuthenticated: false,
        token: null,
        user: null,
        loading: false
      }));
      return false;
    }
  };

  /**
   * 로그인 처리
   */
  const login = async (token: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const isValid = validateAndSetUser(token);
    if (isValid) {
      saveToken(token);
    } else {
      removeToken();
    }
    
    return isValid;
  };

  /**
   * 로그아웃 처리
   */
  const logout = () => {
    removeToken();
    setState({
      isAuthenticated: false,
      token: null,
      user: null,
      loading: false,
      error: null
    });
  };

  /**
   * 외부에서 토큰 설정 (기존 UI에서 전달받을 때 사용)
   */
  const setTokenFromExternal = (token: string) => {
    console.log('🔥 setTokenFromExternal 호출:', token ? `${token.substring(0, 30)}...` : 'null');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    // 즉시 스토리지에 저장 (검증 전에)
    saveToken(token);
    console.log('💾 토큰을 스토리지에 즉시 저장함');
    
    // 저장 후 스토리지 상태 확인
    const savedToken = getToken();
    console.log('🔍 저장 후 스토리지 확인:', savedToken ? `${savedToken.substring(0, 30)}...` : 'null');
    
    const isValid = validateAndSetUser(token);
    if (isValid) {
      console.log('✅ 외부 토큰 검증 성공');
    } else {
      console.log('❌ 외부 토큰 검증 실패');
      // 검증 실패해도 토큰은 유지 (테스트용)
      console.log('⚠️ 테스트를 위해 토큰은 유지함');
    }
  };

  /**
   * 인증 상태 확인
   */
  const checkAuthStatus = () => {
    console.log('🔍 checkAuthStatus 실행');
    setState(prev => ({ ...prev, loading: true }));
    
    const storedToken = getToken();
    console.log('📝 저장된 토큰:', storedToken ? `${storedToken.substring(0, 30)}...` : 'null');
    
    if (storedToken) {
      console.log('✅ 토큰 발견, 검증 시작');
      const isValid = validateAndSetUser(storedToken);
      if (!isValid) {
        console.log('❌ 토큰 검증 실패, 삭제');
        removeToken();
      }
    } else {
      console.log('❌ 토큰 없음, 인증 실패 상태로 설정');
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: false,
        token: null,
        user: null,
        loading: false
      }));
    }
  };

  /**
   * 에러 클리어
   */
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  /**
   * 컴포넌트 마운트 시 토큰 확인
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * 토큰 만료 감지 및 자동 로그아웃
   */
  useEffect(() => {
    if (state.token && state.isAuthenticated) {
      const validation = validateToken(state.token);
      
      if (validation.isExpired) {
        logout();
        return;
      }

      // 토큰 만료 5분 전에 경고
      const warningTime = Math.max(0, validation.timeUntilExpiry - 300); // 5분 전
      const warningTimer = setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          error: '토큰이 곧 만료됩니다. 계속 사용하시려면 새로고침하세요.' 
        }));
      }, warningTime * 1000);

      // 토큰 만료 시 자동 로그아웃
      const logoutTimer = setTimeout(() => {
        logout();
      }, validation.timeUntilExpiry * 1000);

      return () => {
        clearTimeout(warningTimer);
        clearTimeout(logoutTimer);
      };
    }
  }, [state.token, state.isAuthenticated]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    checkAuthStatus,
    clearError,
    setTokenFromExternal
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};