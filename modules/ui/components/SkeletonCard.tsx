// components/ui/SkeletonCard.tsx - Skeleton loader for better perceived performance
import React from 'react';

interface SkeletonCardProps {
  variant?: 'card' | 'list' | 'text' | 'image';
  lines?: number;
  className?: string;
}

export function SkeletonCard({ variant = 'card', lines = 3, className = '' }: SkeletonCardProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  if (variant === 'card') {
    return (
      <div className={`p-6 border border-gray-200 rounded-lg shadow-sm ${className}`}>
        <div className="flex items-center space-x-4">
          <div className={`${baseClasses} h-12 w-12 rounded-full`} />
          <div className="flex-1 space-y-2">
            <div className={`${baseClasses} h-4 w-3/4`} />
            <div className={`${baseClasses} h-4 w-1/2`} />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={`${baseClasses} h-4 ${
                i === lines - 1 ? 'w-2/3' : 'w-full'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className={`${baseClasses} h-4 w-4 rounded`} />
            <div className={`${baseClasses} h-4 flex-1`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} h-4 ${
              i === lines - 1 ? 'w-2/3' : 'w-full'
            }`}
          />
        ))}
      </div>
    );
  }

  if (variant === 'image') {
    return (
      <div className={`${className}`}>
        <div className={`${baseClasses} h-48 w-full rounded-lg`} />
        <div className="mt-4 space-y-2">
          <div className={`${baseClasses} h-4 w-3/4`} />
          <div className={`${baseClasses} h-4 w-1/2`} />
        </div>
      </div>
    );
  }

  return null;
}