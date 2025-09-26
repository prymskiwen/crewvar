import { useEffect } from 'react';
import { useAuth } from '../context/AuthContextFirebase';
import { subscribeToNotifications } from '../firebase/firestore';

export const useBanNotifications = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to user notifications using Firebase
    const unsubscribe = subscribeToNotifications(currentUser.uid, (notifications) => {
      // Check for ban-related notifications
      notifications.forEach(notification => {
        if (notification.type === 'ban') {
          console.log('🚫 Ban notification received:', notification);
          window.dispatchEvent(new CustomEvent('userBanned', { detail: notification }));
        } else if (notification.type === 'unban') {
          console.log('✅ Unban notification received:', notification);
          window.dispatchEvent(new CustomEvent('userUnbanned', { detail: notification }));
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  return null; // No socket reference needed for Firebase
};
