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
} from '@/lib/types';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'frontend-app',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    description: 'React-based frontend application',
    repositoryCount: 5,
    lastActivity: '2024-07-20T14:25:00Z'
  },
  {
    id: '2',
    name: 'backend-services',
    status: 'active',
    createdAt: '2024-02-10T09:15:00Z',
    description: 'Microservices backend architecture',
    repositoryCount: 12,
    lastActivity: '2024-07-19T16:40:00Z'
  },
  {
    id: '3',
    name: 'mobile-app',
    status: 'inactive',
    createdAt: '2024-03-05T11:20:00Z',
    description: 'Cross-platform mobile application',
    repositoryCount: 3,
    lastActivity: '2024-06-15T08:30:00Z'
  },
  {
    id: '4',
    name: 'data-pipeline',
    status: 'active',
    createdAt: '2024-01-20T13:45:00Z',
    description: 'ETL data processing pipeline',
    repositoryCount: 8,
    lastActivity: '2024-07-21T10:15:00Z'
  },
  {
    id: '5',
    name: 'legacy-system',
    status: 'archived',
    createdAt: '2023-11-10T15:00:00Z',
    description: 'Legacy monolithic system',
    repositoryCount: 2,
    lastActivity: '2024-01-05T12:00:00Z'
  }
];

export const mockRepositories: Repository[] = [
  {
    id: '1',
    name: 'frontend-app/web-ui',
    status: 'healthy',
    lastUpdated: '2024-07-20T14:25:00Z',
    size: '245MB',
    tags: 15,
    projectId: '1',
    description: 'Main web user interface'
  },
  {
    id: '2',
    name: 'frontend-app/mobile-ui',
    status: 'warning',
    lastUpdated: '2024-07-19T11:30:00Z',
    size: '180MB',
    tags: 8,
    projectId: '1',
    description: 'Mobile responsive components'
  },
  {
    id: '3',
    name: 'backend-services/auth-service',
    status: 'healthy',
    lastUpdated: '2024-07-21T09:45:00Z',
    size: '95MB',
    tags: 22,
    projectId: '2',
    description: 'Authentication and authorization service'
  },
  {
    id: '4',
    name: 'backend-services/user-service',
    status: 'error',
    lastUpdated: '2024-07-18T16:20:00Z',
    size: '120MB',
    tags: 18,
    projectId: '2',
    description: 'User management service'
  },
  {
    id: '5',
    name: 'data-pipeline/ingestion',
    status: 'healthy',
    lastUpdated: '2024-07-20T20:10:00Z',
    size: '350MB',
    tags: 31,
    projectId: '4',
    description: 'Data ingestion pipeline'
  },
  {
    id: '6',
    name: 'data-pipeline/processing',
    status: 'warning',
    lastUpdated: '2024-07-19T18:45:00Z',
    size: '280MB',
    tags: 12,
    projectId: '4',
    description: 'Data transformation and processing'
  },
  {
    id: '7',
    name: 'mobile-app/ios',
    status: 'healthy',
    lastUpdated: '2024-06-15T08:30:00Z',
    size: '420MB',
    tags: 6,
    projectId: '3',
    description: 'iOS mobile application'
  },
  {
    id: '8',
    name: 'mobile-app/android',
    status: 'healthy',
    lastUpdated: '2024-06-14T15:20:00Z',
    size: '385MB',
    tags: 7,
    projectId: '3',
    description: 'Android mobile application'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'john.doe',
    role: 'admin',
    email: 'john.doe@company.com',
    lastLogin: '2024-07-21T08:30:00Z',
    isActive: true
  },
  {
    id: '2',
    username: 'jane.smith',
    role: 'developer',
    email: 'jane.smith@company.com',
    lastLogin: '2024-07-20T16:45:00Z',
    isActive: true
  },
  {
    id: '3',
    username: 'bob.wilson',
    role: 'developer',
    email: 'bob.wilson@company.com',
    lastLogin: '2024-07-19T12:20:00Z',
    isActive: true
  },
  {
    id: '4',
    username: 'alice.brown',
    role: 'viewer',
    email: 'alice.brown@company.com',
    lastLogin: '2024-07-18T09:15:00Z',
    isActive: true
  },
  {
    id: '5',
    username: 'charlie.davis',
    role: 'developer',
    email: 'charlie.davis@company.com',
    lastLogin: '2024-07-10T14:30:00Z',
    isActive: false
  }
];

export const mockMetrics: DashboardMetrics = {
  totalProjects: mockProjects.length,
  totalRepositories: mockRepositories.length,
  activeUsers: mockUsers.filter(user => user.isActive).length,
  storageUsed: '2.1TB',
  healthyRepos: mockRepositories.filter(repo => repo.status === 'healthy').length,
  warningRepos: mockRepositories.filter(repo => repo.status === 'warning').length,
  errorRepos: mockRepositories.filter(repo => repo.status === 'error').length
};

// 다운로드 트렌드 데이터 (지난 7일)
export const mockDownloadTrend: DownloadTrend[] = [
  { date: '2024-07-15', downloads: 1250 },
  { date: '2024-07-16', downloads: 1480 },
  { date: '2024-07-17', downloads: 1680 },
  { date: '2024-07-18', downloads: 1420 },
  { date: '2024-07-19', downloads: 1890 },
  { date: '2024-07-20', downloads: 2100 },
  { date: '2024-07-21', downloads: 2350 }
];

// 프로젝트별 이미지 수
export const mockProjectImageCounts: ProjectImageCount[] = [
  { projectName: 'frontend-app', imageCount: 15, color: '#3B82F6' },
  { projectName: 'backend-services', imageCount: 32, color: '#10B981' },
  { projectName: 'mobile-app', imageCount: 8, color: '#F59E0B' },
  { projectName: 'data-pipeline', imageCount: 24, color: '#EF4444' },
  { projectName: 'legacy-system', imageCount: 5, color: '#8B5CF6' }
];

// 보안 취약점 현황
export const mockSecurityVulnerabilities: SecurityVulnerability[] = [
  { level: 'critical', count: 2, color: '#DC2626' },
  { level: 'high', count: 8, color: '#F97316' },
  { level: 'medium', count: 15, color: '#EAB308' },
  { level: 'low', count: 23, color: '#22C55E' }
];

// 프로젝트별 스토리지 사용량
export const mockStorageUsage: StorageUsage[] = [
  { projectName: 'frontend-app', storageGB: 45.2, color: '#3B82F6' },
  { projectName: 'backend-services', storageGB: 128.7, color: '#10B981' },
  { projectName: 'mobile-app', storageGB: 32.1, color: '#F59E0B' },
  { projectName: 'data-pipeline', storageGB: 89.4, color: '#EF4444' },
  { projectName: 'legacy-system', storageGB: 18.9, color: '#8B5CF6' }
];

// 인기 저장소
export const mockPopularRepositories: PopularRepository[] = [
  {
    name: 'backend-services/auth-service',
    downloads: 12450,
    stars: 128,
    lastUpdated: '2024-07-21T09:45:00Z'
  },
  {
    name: 'data-pipeline/ingestion',
    downloads: 8920,
    stars: 89,
    lastUpdated: '2024-07-20T20:10:00Z'
  },
  {
    name: 'frontend-app/web-ui',
    downloads: 7340,
    stars: 67,
    lastUpdated: '2024-07-20T14:25:00Z'
  },
  {
    name: 'mobile-app/ios',
    downloads: 5670,
    stars: 45,
    lastUpdated: '2024-06-15T08:30:00Z'
  },
  {
    name: 'backend-services/user-service',
    downloads: 4230,
    stars: 32,
    lastUpdated: '2024-07-18T16:20:00Z'
  }
];