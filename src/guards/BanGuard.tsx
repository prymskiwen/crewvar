import React from 'react';
import { useAuth } from '../context/AuthContextFirebase';
import { BanNotification } from './BanNotification';
import { useBanNotifications } from '../hooks/useBanNotifications';

import { BanGuardProps } from '../types';

export const BanGuard: React.FC<BanGuardProps> = ({ children }) => {
  const { isBanned, banInfo, loading } = useAuth();

  // Initialize ban notifications
  useBanNotifications();

  // Don't render anything while auth is loading
  if (loading) {
    return <>{children}</>;
  }

  if (isBanned && banInfo) {
    return <BanNotification banInfo={banInfo} />;
  }

  return <>{children}</>;
};
