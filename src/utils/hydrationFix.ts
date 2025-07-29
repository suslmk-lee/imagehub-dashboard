/**
 * 브라우저 확장 프로그램으로 인한 hydration 오류 해결
 * 개발 환경에서만 실행됨
 */
export function suppressHydrationWarning() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // 브라우저 확장 프로그램 감지
    const hasExtensionAttribute = (element: Element) => {
      return element.hasAttribute('bis_skin_checked') ||
             element.hasAttribute('data-lastpass-icon-root') ||
             element.hasAttribute('data-1password-root');
    };

    // DOM에서 확장 프로그램 속성 제거
    const cleanExtensionAttributes = () => {
      const elements = document.querySelectorAll('[bis_skin_checked]');
      elements.forEach(el => {
        el.removeAttribute('bis_skin_checked');
      });
    };

    // 페이지 로드 후 실행
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cleanExtensionAttributes);
    } else {
      cleanExtensionAttributes();
    }

    // MutationObserver로 동적 변경 감지
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          if (hasExtensionAttribute(target)) {
            target.removeAttribute('bis_skin_checked');
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked', 'data-lastpass-icon-root', 'data-1password-root']
    });

    // 컴포넌트 언마운트 시 observer 정리
    return () => observer.disconnect();
  }
}