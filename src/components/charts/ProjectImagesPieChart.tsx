'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ProjectImageCount } from '@/lib/types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProjectImagesPieChartProps {
  data: ProjectImageCount[];
  isLoading?: boolean;
}

const ProjectImagesPieChart: React.FC<ProjectImagesPieChartProps> = ({ data, isLoading }) => {
  // 디버깅용 로그 추가
  console.log('프로젝트별 이미지 파이 차트 데이터:', data);
  console.log('로딩 상태:', isLoading);
  
  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }
  
  // 데이터 유효성 검사
  if (!data || data.length === 0) {
    console.log('데이터가 없습니다.');
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-gray-500">데이터가 없습니다.</div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.projectName),
    datasets: [
      {
        data: data.map(item => item.imageCount),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 2,
        hoverOffset: 10,
      }
    ]
  };
  
  // 차트 데이터 로그
  console.log('차트에 전달된 데이터:', chartData);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets;
            if (datasets.length) {
              return chart.data.labels.map((label: string, i: number) => {
                const count = datasets[0].data[i];
                return {
                  text: `${label} (${count}개)`,
                  fillStyle: datasets[0].backgroundColor[i],
                  strokeStyle: datasets[0].borderColor[i],
                  pointStyle: 'circle',
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          label: (context: { dataset: { data: number[] }, parsed: number, label: string }) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed}개 (${percentage}%)`;
          }
        }
      }
    },
    cutout: '50%',
  };

  const totalImages = data.reduce((sum, item) => sum + item.imageCount, 0);

  return (
    <div className="relative h-80">
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalImages}</div>
          <div className="text-sm text-gray-500">총 이미지</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectImagesPieChart;