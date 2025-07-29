'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import MetricCard from '@/components/dashboard/MetricCard';
import RepositoryTable from '@/components/dashboard/RepositoryTable';
import PopularRepositoriesRanking from '@/components/dashboard/PopularRepositoriesRanking';
import RecentProjectsTimeline from '@/components/dashboard/RecentProjectsTimeline';
import Card from '@/components/ui/Card';
import ChartWrapper from '@/components/charts/ChartWrapper';
import { useTokenFromURL } from '@/hooks/useTokenFromURL';
import { api } from '@/lib/api';
import { 
  DashboardMetrics, 
  Repository, 
  DownloadTrend, 
  ProjectImageCount,
  SecurityVulnerability,
  StorageUsage,
  PopularRepository,
  Project
} from '@/lib/types';

// 차트 컴포넌트들을 동적으로 import (SSR 비활성화)
const DownloadTrendChart = dynamic(
  () => import('@/components/charts/DownloadTrendChart'),
  { ssr: false }
);

const ProjectImagesPieChart = dynamic(
  () => import('@/components/charts/ProjectImagesPieChart'),
  { ssr: false }
);

const SecurityVulnerabilitiesChart = dynamic(
  () => import('@/components/charts/SecurityVulnerabilitiesChart'),
  { ssr: false }
);

const StorageUsageChart = dynamic(
  () => import('@/components/charts/StorageUsageChart'),
  { ssr: false }
);

const DashboardContent: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [downloadTrend, setDownloadTrend] = useState<DownloadTrend[]>([]);
  const [projectImageCounts, setProjectImageCounts] = useState<ProjectImageCount[]>([]);
  const [securityVulnerabilities, setSecurityVulnerabilities] = useState<SecurityVulnerability[]>([]);
  const [storageUsage, setStorageUsage] = useState<StorageUsage[]>([]);
  const [popularRepositories, setPopularRepositories] = useState<PopularRepository[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 외부에서 토큰을 받을 수 있도록 훅 사용
  useTokenFromURL();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 프로젝트별 이미지 수 데이터만 별도로 처리
        const projectImageCountsData = await api.getProjectImageCounts();
        console.log('대시보드에서 받은 프로젝트별 이미지 수 데이터:', projectImageCountsData);
        setProjectImageCounts(projectImageCountsData);
        
        // 나머지 데이터 가져오기
        const [
          metricsData, 
          repositoriesData,
          downloadTrendData,
          securityVulnerabilitiesData,
          storageUsageData,
          popularRepositoriesData,
          projectsData
        ] = await Promise.all([
          api.getMetrics(),
          api.getRepositories(),
          api.getDownloadTrend(),
          api.getSecurityVulnerabilities(),
          api.getStorageUsage(),
          api.getPopularRepositories(),
          api.getProjects()
        ]);
        
        setMetrics(metricsData);
        setRepositories(repositoriesData);
        setDownloadTrend(downloadTrendData);
        setSecurityVulnerabilities(securityVulnerabilitiesData);
        setStorageUsage(storageUsageData);
        setPopularRepositories(popularRepositoriesData);
        setRecentProjects(projectsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ImageHub Dashboard</h1>
              <p className="text-gray-600 mt-2">컨테이너 레지스트리 모니터링 및 관리 대시보드</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">실시간 업데이트</span>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                리포트 생성
              </button>
            </div>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="총 프로젝트"
            value={metrics?.totalProjects || 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            change={{ value: 12, type: 'increase', period: '이번 달' }}
          />

          <MetricCard
            title="총 저장소"
            value={metrics?.totalRepositories || 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            }
            change={{ value: 8, type: 'increase', period: '이번 달' }}
          />

          <MetricCard
            title="활성 사용자"
            value={metrics?.activeUsers || 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            change={{ value: 3, type: 'increase', period: '이번 주' }}
          />

          <MetricCard
            title="사용 용량"
            value={metrics?.storageUsed || '0MB'}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            }
            change={{ value: 15, type: 'increase', period: '이번 달' }}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Download Trend Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">다운로드 트렌드</h3>
              <span className="text-sm text-gray-500">지난 7일</span>
            </div>
            <ChartWrapper>
              <DownloadTrendChart data={downloadTrend} isLoading={isLoading} />
            </ChartWrapper>
          </Card>

          {/* Project Images Pie Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">프로젝트별 이미지 수</h3>
              <span className="text-sm text-gray-500">현재 상태</span>
            </div>
            <ChartWrapper>
              <ProjectImagesPieChart data={projectImageCounts} isLoading={isLoading} />
            </ChartWrapper>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Vulnerabilities Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">보안 취약점 현황</h3>
              <span className="text-sm text-gray-500">스캔 결과</span>
            </div>
            <ChartWrapper>
              <SecurityVulnerabilitiesChart data={securityVulnerabilities} isLoading={isLoading} />
            </ChartWrapper>
          </Card>

          {/* Storage Usage Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">프로젝트별 스토리지 사용량</h3>
              <span className="text-sm text-gray-500">GB 단위</span>
            </div>
            <ChartWrapper>
              <StorageUsageChart data={storageUsage} isLoading={isLoading} />
            </ChartWrapper>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Popular Repositories */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">인기 저장소 순위</h3>
                <span className="text-sm text-gray-500">다운로드 기준</span>
              </div>
              <PopularRepositoriesRanking data={popularRepositories} isLoading={isLoading} />
            </Card>
          </div>

          {/* Recent Projects Timeline */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">최근 프로젝트</h3>
              <span className="text-sm text-gray-500">활동 기준</span>
            </div>
            <RecentProjectsTimeline data={recentProjects} isLoading={isLoading} />
          </Card>
        </div>

        {/* Repository Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MetricCard
            title="정상 저장소"
            value={metrics?.healthyRepos || 0}
            className="border-l-4 border-l-green-500 bg-green-50"
          />
          <MetricCard
            title="경고 저장소"
            value={metrics?.warningRepos || 0}
            className="border-l-4 border-l-yellow-500 bg-yellow-50"
          />
          <MetricCard
            title="오류 저장소"
            value={metrics?.errorRepos || 0}
            className="border-l-4 border-l-red-500 bg-red-50"
          />
        </div>

        {/* Repository List */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">전체 저장소 목록</h3>
            <div className="flex items-center space-x-4">
              <select className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>전체 상태</option>
                <option>정상</option>
                <option>경고</option>
                <option>오류</option>
              </select>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>새로고침</span>
              </button>
            </div>
          </div>
          <RepositoryTable repositories={repositories} isLoading={isLoading} />
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;