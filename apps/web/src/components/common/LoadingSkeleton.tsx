import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'card':
        return 'h-48 rounded-lg';
      case 'rectangular':
      default:
        return 'rounded';
    }
  };

  const getInlineStyles = () => {
    const styles: React.CSSProperties = {};
    if (width) styles.width = width;
    if (height) styles.height = height;
    return styles;
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
            style={getInlineStyles()}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={getInlineStyles()}
    />
  );
};

// Dashboard specific loading skeletons
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Section Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <LoadingSkeleton variant="text" width="40%" className="mb-4" />
            <LoadingSkeleton variant="text" lines={2} className="mb-6" />
            
            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <LoadingSkeleton variant="text" width="60%" height={32} className="mb-2" />
                <LoadingSkeleton variant="text" width="40%" height={16} />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <LoadingSkeleton variant="text" width="60%" height={32} className="mb-2" />
                <LoadingSkeleton variant="text" width="40%" height={16} />
              </div>
            </div>
          </div>

          {/* Collection Preview Skeleton */}
          <div className="bg-white shadow-sm rounded-lg p-6 mt-6">
            <LoadingSkeleton variant="text" width="30%" className="mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="text-center">
                  <LoadingSkeleton 
                    variant="circular" 
                    width={64} 
                    height={64} 
                    className="mx-auto mb-2" 
                  />
                  <LoadingSkeleton variant="text" width="80%" height={16} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <LoadingSkeleton variant="text" width="40%" className="mb-4" />
            <div className="text-center">
              <LoadingSkeleton 
                variant="circular" 
                width={64} 
                height={64} 
                className="mx-auto mb-3" 
              />
              <LoadingSkeleton variant="text" width="60%" className="mb-2" />
              <LoadingSkeleton variant="text" width="40%" className="mb-4" />
              <LoadingSkeleton variant="rectangular" width="100%" height={40} />
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <LoadingSkeleton variant="text" width="50%" className="mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton 
                  key={index} 
                  variant="rectangular" 
                  width="100%" 
                  height={40} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <LoadingSkeleton variant="text" width="40%" className="mb-4" />
            
            <div className="space-y-6">
              {/* Email Section */}
              <div>
                <LoadingSkeleton variant="text" width="30%" className="mb-2" />
                <div className="flex items-center justify-between">
                  <LoadingSkeleton variant="text" width="60%" />
                  <LoadingSkeleton variant="rectangular" width={80} height={24} />
                </div>
              </div>

              {/* Display Name Section */}
              <div>
                <LoadingSkeleton variant="text" width="30%" className="mb-2" />
                <LoadingSkeleton variant="text" width="40%" />
              </div>

              {/* Join Date Section */}
              <div>
                <LoadingSkeleton variant="text" width="30%" className="mb-2" />
                <LoadingSkeleton variant="text" width="50%" />
              </div>

              {/* Account Statistics */}
              <div className="border-t pt-4">
                <LoadingSkeleton variant="text" width="40%" className="mb-3" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <LoadingSkeleton variant="text" width={32} height={32} className="mb-1" />
                    <LoadingSkeleton variant="text" width="60%" height={14} />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <LoadingSkeleton variant="text" width={32} height={32} className="mb-1" />
                    <LoadingSkeleton variant="text" width="60%" height={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <LoadingSkeleton variant="text" width="40%" className="mb-4" />
            <div className="text-center">
              <LoadingSkeleton 
                variant="circular" 
                width={64} 
                height={64} 
                className="mx-auto mb-3" 
              />
              <LoadingSkeleton variant="text" width="60%" className="mb-2" />
              <LoadingSkeleton variant="text" width="40%" className="mb-4" />
              <LoadingSkeleton variant="rectangular" width="100%" height={40} />
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <LoadingSkeleton variant="text" width="50%" className="mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton 
                  key={index} 
                  variant="rectangular" 
                  width="100%" 
                  height={40} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;