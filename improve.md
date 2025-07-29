# ImageHub Dashboard 개선 사항

## CORS 문제 해결 및 Harbor API 통합

### 문제 상황
브라우저에서 Harbor API에 직접 접근할 때 CORS (Cross-Origin Resource Sharing) 오류가 발생하는 문제가 있었습니다.

#### 발생 원인
- **Origin 차이**: 현재 앱(`localhost:3000`)에서 Harbor API(`harbor.27.96.159.239.nip.io`)로 직접 요청
- **브라우저 보안 정책**: 브라우저가 보안상 다른 도메인 간 요청을 차단
- **Postman 동작**: Postman은 브라우저가 아니므로 CORS 제한이 없어 정상 동작

### 해결 방법: Next.js API 프록시 구현

#### 1. API 라우트 생성
```typescript
// src/app/api/harbor/projects/route.ts
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
```

#### 2. 클라이언트 코드 수정
```typescript
// src/lib/api.ts - getProjectImageCounts 함수 내부

// 기존: 직접 Harbor API 호출 (CORS 오류 발생)
const response = await fetch('https://harbor.27.96.159.239.nip.io/api/v2.0/projects', {
  headers: {
    'accept': 'application/json',
    'authorization': 'Basic YWRtaW46YWRtaW4=',
    'Access-Control-Allow-Origin': '*' // 클라이언트에서는 작동하지 않음
  }
});

// 수정: 프록시 API 호출 (CORS 문제 해결)
const response = await fetch('/api/harbor/projects');

if (response.ok) {
  const projects = await response.json();
  console.log('Harbor API에서 받은 프로젝트 데이터:', projects);
  
  // 실제 API 데이터를 사용하여 결과 반환
  const projectCounts = projects.map((project: any) => ({
    name: project.name,
    repo_count: project.repo_count || 0,
    project_id: project.project_id
  }));
  
  return projectCounts;
}
```

### 동작 흐름

1. **클라이언트** → `/api/harbor/projects` 요청 (같은 도메인, CORS 제한 없음)
2. **Next.js 서버** → Harbor API 호출 (서버는 CORS 제한 없음)
3. **Harbor API** → 데이터 응답
4. **Next.js 서버** → 클라이언트에게 데이터 전달

### 해결 효과

#### 장점
- **CORS 문제 해결**: 같은 도메인 내 요청이므로 브라우저 CORS 정책에 걸리지 않음
- **보안 강화**: API 인증 정보를 서버에서만 사용, 클라이언트에 노출되지 않음
- **통합 에러 처리**: 서버에서 Harbor API 오류를 일관되게 처리
- **캐싱 가능**: 필요시 Next.js에서 응답 캐싱 설정 가능
- **유지보수성**: Harbor API 엔드포인트 변경 시 서버 코드만 수정하면 됨

#### 결과
- 브라우저에서 Harbor API 데이터를 성공적으로 가져올 수 있게 됨
- 실제 Harbor 프로젝트 데이터를 대시보드에서 표시 가능
- 목업 데이터에서 실제 데이터로 전환 가능

### 추가 개선 사항

향후 다른 Harbor API 엔드포인트도 필요한 경우 동일한 패턴으로 프록시 API를 추가할 수 있습니다:
- `/api/harbor/repositories` - 저장소 목록
- `/api/harbor/artifacts` - 아티팩트 정보
- `/api/harbor/statistics` - 통계 데이터

### 기술적 세부사항

- **Next.js App Router**: `src/app/api/` 디렉터리 구조 사용
- **HTTP 메서드**: GET 요청만 구현 (필요시 POST, PUT, DELETE 추가 가능)
- **에러 처리**: try-catch로 Harbor API 오류를 포착하고 적절한 HTTP 상태 코드 반환
- **인증**: Basic Authentication 사용 (Base64 인코딩된 admin:admin)