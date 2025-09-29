import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'white' | 'gray' | 'teal';
    className?: string;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
};

const colorClasses = {
    primary: 'border-[#069B93]',
    white: 'border-white',
    gray: 'border-gray-400',
    teal: 'border-teal-600'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'primary',
    className = ''
}) => {
    return (
        <div
            className={`
        ${sizeClasses[size]} 
        border-2 
        border-t-transparent 
        rounded-full 
        animate-spin 
        ${colorClasses[color]}
        ${className}
      `}
        />
    );
};

export default LoadingSpinner;