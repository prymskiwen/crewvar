import React from 'react';
import { useAuth } from '../context/AuthContextFirebase';
import { BanNotification } from './BanNotification';

interface BanGuardProps {
  children: React.ReactNode;
}

export const BanGuard: React.FC<BanGuardProps> = ({ children }) => {
  const { isBanned, banInfo } = useAuth();

  if (isBanned && banInfo) {
    return <BanNotification banInfo={banInfo} />;
  }

  return <>{children}</>;
};
