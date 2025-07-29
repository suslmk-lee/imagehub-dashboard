/**
 * 개발 환경에서 브라우저 확장 프로그램으로 인한 hydration 경고 억제
 */
export function suppressHydrationErrors() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const message = args[0];
      
      // Hydration 오류 메시지 필터링
      if (
        typeof message === 'string' &&
        (
          message.includes('Hydration failed') ||
          message.includes('hydration mismatch') ||
          message.includes('bis_skin_checked') ||
          message.includes('server rendered HTML') ||
          message.includes('client properties')
        )
      ) {
        // 이 오류들은 무시
        return;
      }
      
      // 다른 에러는 정상 출력
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args[0];
      
      // Hydration 경고 메시지 필터링
      if (
        typeof message === 'string' &&
        (
          message.includes('Hydration') ||
          message.includes('bis_skin_checked')
        )
      ) {
        // 이 경고들은 무시
        return;
      }
      
      // 다른 경고는 정상 출력
      originalWarn.apply(console, args);
    };

    // 정리 함수 반환
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }
}