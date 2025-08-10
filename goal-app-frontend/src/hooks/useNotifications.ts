import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchNotifications, fetchUnreadCount } from '../store/notificationSlice';

export const useNotifications = (userId?: number) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, isLoading } = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications(userId) as any);
      dispatch(fetchUnreadCount(userId) as any);
    }
  }, [dispatch, userId]);

  return {
    notifications,
    unreadCount,
    isLoading,
  };
};
