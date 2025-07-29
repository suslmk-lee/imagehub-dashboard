import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 프로덕션 빌드 최적화
  output: 'standalone',
  
  // Hydration 문제 해결을 위한 설정
  experimental: {
    optimizePackageImports: ['@/components', '@/contexts', '@/hooks'],
  },
  // React strict mode 비활성화
  reactStrictMode: false,
  // 컴파일러 최적화
  compiler: {
    // 개발 환경에서 React 개발자 도구 최적화
    reactRemoveProperties: false,
  },
  // Webpack 설정으로 hydration 경고 억제
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = 'eval-cheap-module-source-map';
    }
    return config;
  },
};

export default nextConfig;
