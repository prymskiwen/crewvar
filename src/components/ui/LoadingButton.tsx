import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingButtonProps {
    isLoading: boolean;
    loadingText?: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
    isLoading,
    loadingText = 'Loading...',
    children,
    className = '',
    disabled = false,
    onClick,
    type = 'button'
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`
        flex items-center justify-center gap-2
        ${isLoading || disabled
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : ''
                }
        ${className}
      `}
        >
            {isLoading && <LoadingSpinner size="sm" color="white" />}
            {isLoading ? loadingText : children}
        </button>
    );
};

export default LoadingButton;
