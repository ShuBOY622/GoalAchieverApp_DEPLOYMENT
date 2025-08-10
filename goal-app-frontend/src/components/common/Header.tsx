import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bell, User, LogOut, Zap } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { NotificationBell } from '../notifications/NotificationBell';
import { ChallengeBell } from '../challenges/ChallengeBell';
import { notificationService } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Use refs to avoid dependency issues
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);
  
  // Stable function that doesn't change on re-renders
  const loadUnreadCount = async () => {
    if (!user?.id || isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      console.log('🔍 Loading unseen count for user:', user.id);
      const count = await notificationService.getUnseenCount(user.id);
      
      setUnreadCount(prevCount => {
        // If unread count increased, trigger refresh events for other components
        if (count > prevCount && prevCount > 0) {
          console.log('📢 New notifications detected, triggering refresh events...');
          // Use setTimeout to prevent immediate cascading calls
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refreshNotifications'));
            window.dispatchEvent(new CustomEvent('refreshDashboard'));
          }, 100);
        }
        return count;
      });
    } catch (error) {
      console.error('Failed to load unseen count:', error);
    } finally {
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    
    // Initial load
    loadUnreadCount();
    
    // Set up aggressive polling for real-time updates
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      loadUnreadCount();
    }, 5000); // 5 seconds for real-time polling
    
    // Event listeners with minimal throttling for quick updates
    const handleChallengeAccepted = () => {
      console.log('Challenge accepted, refreshing notifications...');
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = setTimeout(() => {
        loadUnreadCount();
      }, 200); // Reduced to 200ms for instant updates
    };

    const handleNotificationRefresh = () => {
      console.log('Manual notification refresh triggered...');
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = setTimeout(() => {
        loadUnreadCount();
      }, 100); // Reduced to 100ms for immediate updates
    };

    // Add event listeners
    window.addEventListener('challengeAccepted', handleChallengeAccepted);
    window.addEventListener('challengeRejected', handleNotificationRefresh);
    window.addEventListener('refreshNotifications', handleNotificationRefresh);
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      window.removeEventListener('challengeAccepted', handleChallengeAccepted);
      window.removeEventListener('challengeRejected', handleNotificationRefresh);
      window.removeEventListener('refreshNotifications', handleNotificationRefresh);
    };
  }, [user?.id]); // Only depend on user.id, nothing else


  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg border-b border-white/20 px-6 py-4"
    >
      <div className="flex items-center justify-between">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-3 cursor-pointer"
      >
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">🎯</span>
        </div>
        <h1 className="text-2xl font-bold text-white">GoalAchiever</h1>
      </motion.div>

        <div className="flex items-center space-x-4">
          {/* Enhanced Challenge Bell with Count Badge */}
          <ChallengeBell userId={user?.id} />

          {/* ✅ Pass unreadCount to prevent duplicate API calls */}
          <NotificationBell 
            unreadCount={unreadCount} 
            onCountChange={setUnreadCount}
              userId={user?.id} // ✅ Pass user ID as prop
          />
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-3 bg-white/10 rounded-lg px-4 py-2 cursor-pointer hover:bg-white/20 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-white">
              <p className="font-medium">{user?.username}</p>
              <p className="text-sm opacity-75">{user?.points} points</p>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};
