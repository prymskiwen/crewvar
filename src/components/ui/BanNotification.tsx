import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextFirebase';

interface BanNotificationProps {
  banInfo: {
    reason: string;
    message: string;
    banExpiresAt?: Date;
  };
}

export const BanNotification: React.FC<BanNotificationProps> = ({ banInfo }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Auto logout after showing the message
    const timer = setTimeout(() => {
      logout();
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Account Suspended</h1>
          <p className="text-gray-600 mb-4">{banInfo.message}</p>

          {banInfo.reason && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Reason:</strong> {banInfo.reason}
              </p>
            </div>
          )}

          {banInfo.banExpiresAt && (
            <p className="text-sm text-gray-500 mb-4">
              Suspension expires: {banInfo.banExpiresAt.toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            You will be automatically signed out in a few seconds.
          </p>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign Out Now
          </button>
        </div>
      </div>
    </div>
  );
};
