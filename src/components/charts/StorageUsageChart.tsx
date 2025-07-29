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
import { StorageUsage } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StorageUsageChartProps {
  data: StorageUsage[];
  isLoading?: boolean;
}

const StorageUsageChart: React.FC<StorageUsageChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.projectName),
    datasets: [
      {
        label: '스토리지 사용량 (GB)',
        data: data.map(item => item.storageGB),
        backgroundColor: data.map(item => item.color + '80'), // Add transparency
        borderColor: data.map(item => item.color),
        borderWidth: 2,
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
            return `사용량: ${context.parsed.y} GB`;
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
            size: 11,
          },
          maxRotation: 45,
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
          callback: (value: number | string) => {
            return value + ' GB';
          }
        },
        beginAtZero: true,
      }
    },
  };

  const totalStorage = data.reduce((sum, item) => sum + item.storageGB, 0);
  const averageStorage = totalStorage / data.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-semibold text-blue-600">
            {totalStorage.toFixed(1)} GB
          </div>
          <div className="text-blue-600">총 사용량</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-semibold text-green-600">
            {averageStorage.toFixed(1)} GB
          </div>
          <div className="text-green-600">평균 사용량</div>
        </div>
      </div>
      <div className="h-72">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default StorageUsageChart;