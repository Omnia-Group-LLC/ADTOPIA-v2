// components/ui/TimeoutAlert.tsx - Timeout alert with recovery options
import React, { useState, useEffect } from 'react';
import { Spinner } from './Spinner';

interface TimeoutAlertProps {
  isVisible: boolean;
  onRetry: () => void;
  onCancel: () => void;
  timeoutDuration?: number;
  className?: string;
}

export function TimeoutAlert({
  isVisible,
  onRetry,
  onCancel,
  timeoutDuration = 10000,
  className = ''
}: TimeoutAlertProps) {
  const [countdown, setCountdown] = useState(timeoutDuration / 1000);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Operation Taking Too Long
            </h3>
            <p className="text-sm text-gray-500">
              This is taking longer than expected. You can retry or cancel.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Time remaining:</span>
            <span className="font-medium">{countdown}s</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / (timeoutDuration / 1000)) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isRetrying ? (
              <>
                <Spinner size="sm" color="white" className="mr-2" />
                Retrying...
              </>
            ) : (
              'Retry'
            )}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>If this continues, try refreshing the page or check your connection.</p>
        </div>
      </div>
    </div>
  );
}