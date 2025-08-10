// src/hooks/useUserStats.tsx
import { useAppDispatch, useAppSelector } from './reduxHooks';
import { refreshUser } from '../store/authSlice';

export const useUserStats = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const refreshUserStats = async () => {
    if (user) {
      try {
        await dispatch(refreshUser(user.id)).unwrap();
      } catch (error) {
        console.error('Failed to refresh user stats:', error);
      }
    }
  };

  return { refreshUserStats };
};
