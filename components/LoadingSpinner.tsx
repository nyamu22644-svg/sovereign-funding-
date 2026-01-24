import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'neon' | 'white' | 'gray';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'neon',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    neon: 'border-neon',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 ${colorClasses[color]} border-t-transparent`}
        style={{ borderWidth: '2px' }}
      />
    </div>
  );
};

export default LoadingSpinner;