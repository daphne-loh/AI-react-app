import React, { useState, useCallback } from 'react';

interface RetryComponentProps {
  children: React.ReactNode;
  onRetry?: () => Promise<void> | void;
  retryText?: string;
  errorMessage?: string;
  showRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export const RetryComponent: React.FC<RetryComponentProps> = ({
  children,
  onRetry,
  retryText = 'Try Again',
  errorMessage = 'Something went wrong. Please try again.',
  showRetry = true,
  maxRetries = 3,
  retryDelay = 1000
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      return;
    }

    setIsRetrying(true);
    setError(null);

    try {
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      if (onRetry) {
        await onRetry();
      }
      
      setRetryCount(0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, retryCount, maxRetries, retryDelay]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-center w-12 h-12 mb-4 bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error Occurred
        </h3>
        
        <p className="text-center text-gray-600 mb-4 max-w-sm">
          {errorMessage}
        </p>

        {error.message && (
          <p className="text-sm text-red-600 mb-4 font-mono bg-red-50 px-3 py-2 rounded border border-red-200">
            {error.message}
          </p>
        )}

        {showRetry && retryCount < maxRetries && (
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary-500"
            >
              {isRetrying ? 'Retrying...' : retryText}
            </button>
            
            {retryCount > 0 && (
              <p className="text-sm text-gray-500">
                Attempt {retryCount + 1} of {maxRetries}
              </p>
            )}
          </div>
        )}

        {retryCount >= maxRetries && (
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">
              Maximum retry attempts reached.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
            >
              Reload Page
            </button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

// Network connectivity checker
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Network status component
export const NetworkStatus: React.FC = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
      <div className="flex items-center justify-center space-x-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
          />
        </svg>
        <span className="text-sm font-medium">
          No internet connection. Some features may not work properly.
        </span>
      </div>
    </div>
  );
};

export default RetryComponent;