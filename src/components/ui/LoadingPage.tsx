import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingPageProps {
    message?: string;
    backgroundColor?: string;
    showLogo?: boolean;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
    message = 'Loading...',
    backgroundColor = '#B9F3DF',
    showLogo = false
}) => {
    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ backgroundColor }}
        >
            <div className="text-center">
                {showLogo && (
                    <div className="w-16 h-16 bg-[#069B93] rounded-full flex items-center justify-center mx-auto mb-4">
                        <LoadingSpinner size="lg" color="white" />
                    </div>
                )}
                {!showLogo && (
                    <div className="mb-4">
                        <LoadingSpinner size="xl" color="primary" />
                    </div>
                )}
                <p className="text-[#069B93] font-medium">{message}</p>
            </div>
        </div>
    );
};

export default LoadingPage;
