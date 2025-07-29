import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 기본 헬스체크
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0'
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 503 }
    );
  }
}

// HEAD 요청도 지원 (일부 헬스체크 도구에서 사용)
export async function HEAD() {
  return new Response(null, { status: 200 });
}