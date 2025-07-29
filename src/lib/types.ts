export interface Project {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  description?: string;
  repositoryCount: number;
  lastActivity: string;
}

export interface Repository {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  lastUpdated: string;
  size: string;
  tags: number;
  projectId: string;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'developer' | 'viewer';
  email: string;
  lastLogin: string;
  isActive: boolean;
}

export interface DashboardMetrics {
  totalProjects: number;
  totalRepositories: number;
  activeUsers: number;
  storageUsed: string;
  healthyRepos: number;
  warningRepos: number;
  errorRepos: number;
}

export interface DownloadTrend {
  date: string;
  downloads: number;
}

export interface ProjectImageCount {
  projectName: string;
  imageCount: number;
  color: string;
}

export interface SecurityVulnerability {
  level: 'critical' | 'high' | 'medium' | 'low';
  count: number;
  color: string;
}

export interface StorageUsage {
  projectName: string;
  storageGB: number;
  color: string;
}

export interface PopularRepository {
  name: string;
  downloads: number;
  stars: number;
  lastUpdated: string;
}