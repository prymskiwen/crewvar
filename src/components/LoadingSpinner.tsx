/**
 * Loading Spinner Component
 * 
 * Professional loading indicators for the CrewVar application
 */

import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'white' | 'gray';
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

/**
 * Size configurations for the spinner
 */
const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
};

/**
 * Color configurations for the spinner
 */
const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400',
};

/**
 * Loading Spinner Component
 * 
 * @param size - Size of the spinner (default: 'md')
 * @param color - Color of the spinner (default: 'primary')
 * @param text - Optional text to display below spinner
 * @param fullScreen - Whether to display as full screen overlay
 * @param className - Additional CSS classes
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'primary',
    text,
    fullScreen = false,
    className = '',
}) => {
    const spinnerElement = (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
                role="status"
                aria-label="Loading"
            >
                <svg
                    className="w-full h-full"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
            {text && (
                <p className={`mt-2 text-sm ${colorClasses[color]}`}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                {spinnerElement}
            </div>
        );
    }

    return spinnerElement;
};

/**
 * Page Loading Component
 * 
 * Full-screen loading component for page transitions
 */
export const PageLoading: React.FC<{ text?: string }> = ({
    text = 'Loading...'
}) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text={text} />
    </div>
);

/**
 * Button Loading Component
 * 
 * Small spinner for buttons and inline loading states
 */
export const ButtonLoading: React.FC<{ className?: string }> = ({
    className = ''
}) => (
    <LoadingSpinner
        size="sm"
        color="white"
        className={className}
    />
);

/**
 * Card Loading Component
 * 
 * Loading state for cards and content areas
 */
export const CardLoading: React.FC<{ text?: string }> = ({
    text = 'Loading content...'
}) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
        <LoadingSpinner text={text} />
    </div>
);

/**
 * Skeleton Loading Components
 * 
 * Skeleton placeholders for better perceived performance
 */

export const SkeletonText: React.FC<{
    lines?: number;
    className?: string
}> = ({
    lines = 1,
    className = ''
}) => (
        <div className={`animate-pulse ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
                <div
                    key={index}
                    className="h-4 bg-gray-200 rounded mb-2"
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                />
            ))}
        </div>
    );

export const SkeletonCard: React.FC<{ className?: string }> = ({
    className = ''
}) => (
    <div className={`bg-white rounded-lg shadow-sm border p-6 animate-pulse ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
    </div>
);

export const SkeletonList: React.FC<{
    items?: number;
    className?: string
}> = ({
    items = 3,
    className = ''
}) => (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: items }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );

export default LoadingSpinner;
