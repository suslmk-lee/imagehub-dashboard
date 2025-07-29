'use client';

import React from 'react';
import { Project } from '@/lib/types';

interface RecentProjectsTimelineProps {
  data: Project[];
  isLoading?: boolean;
}

const RecentProjectsTimeline: React.FC<RecentProjectsTimelineProps> = ({ 
  data, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-3 h-3 bg-gray-200 rounded-full mt-2"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '오늘';
    if (diffDays === 2) return '어제';
    if (diffDays <= 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      case 'archived': return '보관됨';
      default: return status;
    }
  };

  // Sort by lastActivity, most recent first
  const sortedProjects = [...data].sort((a, b) => 
    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  return (
    <div className="space-y-6">
      {sortedProjects.map((project, index) => (
        <div key={project.id} className="relative">
          {/* Timeline line */}
          {index < sortedProjects.length - 1 && (
            <div className="absolute left-6 top-6 w-0.5 h-16 bg-gray-200"></div>
          )}
          
          <div className="flex items-start space-x-4">
            {/* Timeline dot */}
            <div className={`
              w-3 h-3 rounded-full mt-2 ring-4 ring-white border-2 border-gray-200
              ${getStatusColor(project.status)}
            `}></div>
            
            {/* Project info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">
                    {project.name}
                  </h4>
                  <span className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${project.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : project.status === 'inactive'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {getStatusText(project.status)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(project.lastActivity)}
                </span>
              </div>
              
              {project.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {project.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <span>{project.repositoryCount}개 저장소</span>
                </span>
                <span className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>생성: {formatDate(project.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentProjectsTimeline;