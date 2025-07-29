'use client';

import React from 'react';
import { PopularRepository } from '@/lib/types';

interface PopularRepositoriesRankingProps {
  data: PopularRepository[];
  isLoading?: boolean;
}

const PopularRepositoriesRanking: React.FC<PopularRepositoriesRankingProps> = ({ 
  data, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-500 text-white'; // Gold
      case 1: return 'bg-gray-400 text-white';   // Silver
      case 2: return 'bg-amber-600 text-white';  // Bronze
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  const getRankIcon = (index: number) => {
    if (index < 3) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {data.map((repo, index) => (
        <div 
          key={repo.name} 
          className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
        >
          {/* Rank */}
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
            ${getRankColor(index)}
          `}>
            {getRankIcon(index) || (index + 1)}
          </div>

          {/* Repository Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 truncate">
                {repo.name}
              </h4>
              {index < 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  인기
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{repo.downloads.toLocaleString()}</span>
              </span>
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{repo.stars}</span>
              </span>
              <span>{formatDate(repo.lastUpdated)}</span>
            </div>
          </div>

          {/* Trend Indicator */}
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1 text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              <span className="text-sm font-medium">
                +{Math.floor(Math.random() * 20 + 5)}%
              </span>
            </div>
            <span className="text-xs text-gray-400">이번 주</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PopularRepositoriesRanking;