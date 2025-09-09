import { useState, useEffect } from "react";

interface SuccessNotificationProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export const SuccessNotification = ({ 
    message, 
    onClose, 
    duration = 3000 
}: SuccessNotificationProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Allow fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <span className="text-green-500 text-sm">✓</span>
                </div>
                <span className="font-medium">{message}</span>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="text-white hover:text-green-200 transition-colors"
                >
                    ×
                </button>
            </div>
        </div>
    );
};
