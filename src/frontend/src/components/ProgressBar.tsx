import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-10">
      <div className="h-2 bg-gray-200">
        <div 
          className="h-full transition-all duration-500 ease-out"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: 'var(--primary-color)' 
          }}
        />
      </div>
      <div className="text-center py-2 text-sm" style={{ color: 'var(--font-color-secondary)' }}>
        Question {current} of {total}
      </div>
    </div>
  );
}