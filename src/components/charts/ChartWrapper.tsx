'use client';

import React, { useEffect, useState } from 'react';

interface ChartWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({ children, fallback }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return fallback || (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ChartWrapper;