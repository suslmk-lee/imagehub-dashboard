import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://harbor.27.96.159.239.nip.io/api/v2.0/projects', {
      headers: {
        'accept': 'application/json',
        'authorization': 'Basic YWRtaW46YWRtaW4=', // admin:admin Base64 인코딩
      }
    });
    
    if (!response.ok) {
      throw new Error(`Harbor API 응답 오류: ${response.status}`);
    }
    
    const projects = await response.json();
    return NextResponse.json(projects);
    
  } catch (error) {
    console.error('Harbor API 호출 실패:', error);
    return NextResponse.json(
      { error: 'Harbor API 호출에 실패했습니다.' },
      { status: 500 }
    );
  }
}