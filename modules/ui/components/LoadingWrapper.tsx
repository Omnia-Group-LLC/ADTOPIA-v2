// components/ui/LoadingWrapper.tsx - Comprehensive loading wrapper with timeout handling
import React, { useState, useEffect } from 'react';
import { Spinner } from './Spinner';
import { SkeletonCard } from './SkeletonCard';
import { TimeoutAlert } from './TimeoutAlert';

interface LoadingWrapperProps {
  isLoading: boolean;
  error: string | null;
  timeout?: number;
  onRetry?: () => void;
  onTimeout?: () => void;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeletonVariant?: 'card' | 'list' | 'text' | 'image';
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export function LoadingWrapper({
  isLoading,
  error,
  timeout = 10000,
  onRetry,
  onTimeout,
  children,
  fallback,
  skeletonVariant = 'card',
  showProgress = false,
  progress = 0,
  className = ''
}: LoadingWrapperProps) {
  const [showTimeoutAlert, setShowTimeoutAlert] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading && timeout > 0) {
      const id = setTimeout(() => {
        setShowTimeoutAlert(true);
        onTimeout?.();
      }, timeout);

      setTimeoutId(id);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      setShowTimeoutAlert(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, timeout, onTimeout]);

  const handleRetry = () => {
    setShowTimeoutAlert(false);
    onRetry?.();
  };

  const handleCancel = () => {
    setShowTimeoutAlert(false);
  };

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading content
            </h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        {onRetry && (
          <div className="mt-4">
            <button
              onClick={onRetry}
              className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        {fallback || (
          <div className={`${className}`}>
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Spinner size="lg" />
                {showProgress && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Loading... {Math.round(progress)}%
                    </div>
                    <div className="w-64 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <SkeletonCard variant={skeletonVariant} />
          </div>
        )}
        <TimeoutAlert
          isVisible={showTimeoutAlert}
          onRetry={handleRetry}
          onCancel={handleCancel}
          timeoutDuration={timeout}
        />
      </>
    );
  }

  return <div className={className}>{children}</div>;
}