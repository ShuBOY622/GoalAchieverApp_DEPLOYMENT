import { useCallback } from 'react';
import { notificationService } from '../services/notificationService';

export const useNotificationRefresh = (userId?: number) => {
  const refreshNotifications = useCallback(async () => {
    if (!userId) return;
    
    try {
      console.log('🔄 Refreshing notifications for user:', userId);
      
      // Trigger a manual refresh by dispatching custom event
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
      
      // Also return fresh data for immediate use
      const [notifications, unseenCount] = await Promise.all([
        notificationService.getUserNotifications(userId, 10, 0),
        notificationService.getUnseenCount(userId)
      ]);
      
      return { notifications, unseenCount };
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
      return null;
    }
  }, [userId]);

  return { refreshNotifications };
};