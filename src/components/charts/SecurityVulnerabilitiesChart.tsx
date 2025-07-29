'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SecurityVulnerability } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SecurityVulnerabilitiesChartProps {
  data: SecurityVulnerability[];
  isLoading?: boolean;
}

const SecurityVulnerabilitiesChart: React.FC<SecurityVulnerabilitiesChartProps> = ({ 
  data, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const levelLabels = {
    critical: '긴급',
    high: '높음',
    medium: '보통',
    low: '낮음'
  };

  const chartData = {
    labels: data.map(item => levelLabels[item.level]),
    datasets: [
      {
        label: '취약점 수',
        data: data.map(item => item.count),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          label: (context: { parsed: { y: number } }) => {
            return `취약점: ${context.parsed.y}개`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'bold' as const,
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          },
          stepSize: 1,
        },
        beginAtZero: true,
      }
    },
  };

  const totalVulnerabilities = data.reduce((sum, item) => sum + item.count, 0);
  const criticalCount = data.find(item => item.level === 'critical')?.count || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          총 {totalVulnerabilities}개 취약점
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-600 font-medium">
              긴급 {criticalCount}개
            </span>
          </div>
        )}
      </div>
      <div className="h-72">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SecurityVulnerabilitiesChart;