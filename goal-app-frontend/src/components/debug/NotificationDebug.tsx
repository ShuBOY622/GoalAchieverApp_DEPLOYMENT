import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Bell, CheckCircle } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useAppSelector } from '../../hooks/reduxHooks';
import { Notification } from '../../types/notification';
import { AnimatedButton } from '../common/AnimatedButton';
import { MotionCard } from '../common/MotionCard';

export const NotificationDebug: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('🔍 Debug: Fetching notifications for user:', user.id);
      
      const [notifs, count] = await Promise.all([
        notificationService.getUserNotifications(user.id, 20, 0),
        notificationService.getUnseenCount(user.id)
      ]);
      
      setNotifications(notifs);
      setUnseenCount(count);
      setLastRefresh(new Date());
      
      console.log('📬 Debug: Received notifications:', notifs);
      console.log('📊 Debug: Unseen count:', count);
    } catch (error) {
      console.error('❌ Debug: Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const triggerRefresh = () => {
    window.dispatchEvent(new CustomEvent('refreshNotifications'));
    fetchNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CHALLENGE_ACCEPTED':
      case 'CHALLENGE_RECEIVED':
        return '🎯';
      case 'GOAL_ASSIGNED':
        return '📋';
      case 'GOAL_COMPLETED_BY_FRIEND':
        return '🎉';
      case 'FRIEND_REQUEST':
        return '👥';
      default:
        return '📢';
    }
  };

  return (
    <MotionCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Bell className="mr-2" size={20} />
          Notification Debug Panel
        </h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Unseen: <span className="font-bold text-red-600">{unseenCount}</span>
          </span>
          <AnimatedButton
            onClick={triggerRefresh}
            disabled={loading}
            size="sm"
            variant="primary"
            className="flex items-center"
          >
            <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </AnimatedButton>
        </div>
      </div>

      {lastRefresh && (
        <div className="mb-4 text-xs text-gray-500">
          Last refresh: {lastRefresh.toLocaleTimeString()}
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
            />
            <p className="text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-gray-500">No notifications found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try accepting a challenge or completing a shared goal
            </p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 border rounded-lg ${
                notification.seen ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">
                      {notification.type}
                    </span>
                    {!notification.seen && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>ID: {notification.id}</span>
                    <span>User: {notification.userId}</span>
                    {notification.relatedId && (
                      <span>Related: {notification.relatedId}</span>
                    )}
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info:</h4>
        <div className="text-xs text-yellow-700 space-y-1">
          <div>User ID: {user?.id}</div>
          <div>Total Notifications: {notifications.length}</div>
          <div>Unseen Count: {unseenCount}</div>
          <div>API Base URL: {process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}</div>
          <div>Auth Token: {localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'}</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="text-sm font-semibold text-red-800 mb-2">🚨 Backend Issue Detected:</h4>
        <div className="text-xs text-red-700 space-y-1">
          <div>• Kafka is generating notifications correctly</div>
          <div>• But REST API returns no notifications</div>
          <div>• This suggests Kafka consumer is not saving to database</div>
          <div>• Check your notification-service Kafka consumer</div>
          <div>• Verify database connection and notification table</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Expected Kafka Messages:</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div>• CHALLENGE_RECEIVED - when challenge is sent</div>
          <div>• CHALLENGE_ACCEPTED - when challenge is accepted</div>
          <div>• GOAL_ASSIGNED - when shared goal is created</div>
          <div>• GOAL_COMPLETED_BY_FRIEND - when friend completes goal</div>
        </div>
      </div>
    </MotionCard>
  );
};