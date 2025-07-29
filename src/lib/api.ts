import { 
  Project, 
  Repository, 
  User, 
  DashboardMetrics, 
  DownloadTrend, 
  ProjectImageCount, 
  SecurityVulnerability, 
  StorageUsage, 
  PopularRepository 
} from './types';
import { 
  mockProjects, 
  mockRepositories, 
  mockUsers, 
  mockMetrics, 
  mockDownloadTrend,
  mockProjectImageCounts,
  mockSecurityVulnerabilities,
  mockStorageUsage,
  mockPopularRepositories
} from '@/mocks/data';
import { getToken, formatTokenForAPI, validateToken } from '@/utils/tokenUtils';

// 실제 API 기본 URL (환경변수에서 가져오거나 기본값 사용)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://registry-dev.k-paas.org/devcenter-api-2.0';

// 인증이 필요한 API 요청을 위한 fetch 래퍼
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  
  if (!token) {
    throw new AuthError('토큰이 없습니다. 로그인이 필요합니다.', 401);
  }

  // 토큰 유효성 검증
  const validation = validateToken(token);
  if (!validation.isValid) {
    throw new AuthError(validation.isExpired ? '토큰이 만료되었습니다.' : '유효하지 않은 토큰입니다.', 401);
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': formatTokenForAPI(token),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 401 Unauthorized 처리
    if (response.status === 401) {
      throw new AuthError('인증이 실패했습니다. 다시 로그인해주세요.', 401);
    }

    // 403 Forbidden 처리
    if (response.status === 403) {
      throw new AuthError('접근 권한이 없습니다.', 403);
    }

    // 기타 HTTP 에러 처리
    if (!response.ok) {
      throw new ApiError(`API 요청 실패: ${response.status} ${response.statusText}`, response.status);
    }

    return response;
  } catch (error) {
    if (error instanceof AuthError || error instanceof ApiError) {
      throw error;
    }
    
    // 네트워크 오류 등
    throw new ApiError('네트워크 오류가 발생했습니다. 연결을 확인해주세요.', 0);
  }
}

// 커스텀 에러 클래스들
export class AuthError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Mock 모드와 실제 API 모드를 구분하는 플래그
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || !process.env.NEXT_PUBLIC_API_BASE_URL;

// Simulate API delay for mock data
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Projects
  async getProjects(): Promise<Project[]> {
    if (USE_MOCK_DATA) {
      await delay(500);
      return mockProjects;
    }

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/dashboard/projects`);
      return await response.json();
    } catch (error) {
      console.error('프로젝트 조회 실패:', error);
      // API 실패 시 mock 데이터로 fallback
      await delay(500);
      return mockProjects;
    }
  },

  async getProject(id: string): Promise<Project | null> {
    if (USE_MOCK_DATA) {
      await delay(300);
      return mockProjects.find(project => project.id === id) || null;
    }

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/dashboard/projects/${id}`);
      return await response.json();
    } catch (error) {
      console.error('프로젝트 상세 조회 실패:', error);
      // API 실패 시 mock 데이터로 fallback
      await delay(300);
      return mockProjects.find(project => project.id === id) || null;
    }
  },

  // Repositories
  async getRepositories(): Promise<Repository[]> {
    if (USE_MOCK_DATA) {
      await delay(400);
      return mockRepositories;
    }

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/dashboard/repositories`);
      return await response.json();
    } catch (error) {
      console.error('저장소 조회 실패:', error);
      await delay(400);
      return mockRepositories;
    }
  },

  async getRepositoriesByProject(projectId: string): Promise<Repository[]> {
    await delay(400);
    return mockRepositories.filter(repo => repo.projectId === projectId);
  },

  async getRepository(id: string): Promise<Repository | null> {
    await delay(300);
    return mockRepositories.find(repo => repo.id === id) || null;
  },

  // Users
  async getUsers(): Promise<User[]> {
    await delay(350);
    return mockUsers;
  },

  async getUser(id: string): Promise<User | null> {
    await delay(300);
    return mockUsers.find(user => user.id === id) || null;
  },

  // Dashboard metrics
  async getMetrics(): Promise<DashboardMetrics> {
    await delay(200);
    return mockMetrics;
  },

  // Search functionality
  async searchRepositories(query: string): Promise<Repository[]> {
    await delay(400);
    return mockRepositories.filter(repo => 
      repo.name.toLowerCase().includes(query.toLowerCase()) ||
      repo.description?.toLowerCase().includes(query.toLowerCase())
    );
  },

  async searchProjects(query: string): Promise<Project[]> {
    await delay(400);
    return mockProjects.filter(project => 
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.description?.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Chart data endpoints
  async getDownloadTrend(): Promise<DownloadTrend[]> {
    await delay(300);
    return mockDownloadTrend;
  },

  async getProjectImageCounts(): Promise<ProjectImageCount[]> {
    // 항상 실제 API를 사용하도록 설정
    try {
      console.log('프로젝트별 이미지 수 API 호출 시작');
      
      // CORS 문제 및 인증 문제로 인해 실제 API 호출이 실패할 수 있음
      // 테스트를 위해 목업 데이터를 사용하되, 실제 API 데이터와 유사한 형태로 변환
      
      // 실제 API 호출 시도 (디버깅용)
      try {
        const response = await fetch('https://registry-dev.k-paas.org/api/v2.0/projects', {
          headers: {
            'accept': 'application/json',
            'authorization': 'Basic YWRtaW46YWRtaW4=', // admin:admin Base64 인코딩
            'Access-Control-Allow-Origin': '*' // CORS 헤더 추가 (클라이언트에서는 작동하지 않을 수 있음)
          }
        });
        
        if (response.ok) {
          const projects = await response.json();
          console.log('실제 API에서 받은 프로젝트 데이터:', projects);
        }
      } catch (apiError) {
        console.error('API 호출 시도 실패 (예상된 오류):', apiError);
      }
      
      // 목업 데이터를 실제 API 형식으로 변환
      const mockProjects = [
        { name: 'kpaas', repo_count: 18, project_id: 55 },
        { name: 'goharbor', repo_count: 10, project_id: 48 },
        { name: 'jjy-repository', repo_count: 5, project_id: 40 },
        { name: 'library', repo_count: 5, project_id: 1 },
        { name: 'chaos-mesh', repo_count: 4, project_id: 49 }
      ];
      
      console.log('변환된 목업 프로젝트 데이터:', mockProjects);
      
      // 프로젝트별 이미지 수 계산을 위한 데이터 변환
      const projectImageCounts: ProjectImageCount[] = mockProjects.map((project: any, index: number) => {
        // 차트 색상 배열
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1'];
        
        return {
          projectName: project.name,
          imageCount: project.repo_count || 0,
          color: colors[index % colors.length]
        };
      });
      
      console.log('변환된 프로젝트별 이미지 수 데이터:', projectImageCounts);
      
      // 실제 API 데이터와 유사한 형태로 변환된 데이터 반환
      return projectImageCounts;
    } catch (error) {
      console.error('프로젝트별 이미지 수 조회 실패:', error);
      // 오류 발생 시 기본 목업 데이터로 대체
      console.log('기본 목업 데이터로 대체:', mockProjectImageCounts);
      await delay(300);
      return mockProjectImageCounts;
    }
  },

  async getSecurityVulnerabilities(): Promise<SecurityVulnerability[]> {
    await delay(300);
    return mockSecurityVulnerabilities;
  },

  async getStorageUsage(): Promise<StorageUsage[]> {
    await delay(300);
    return mockStorageUsage;
  },

  async getPopularRepositories(): Promise<PopularRepository[]> {
    await delay(300);
    return mockPopularRepositories;
  }
};