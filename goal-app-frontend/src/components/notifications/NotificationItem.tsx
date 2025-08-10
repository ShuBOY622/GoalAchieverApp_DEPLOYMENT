import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, UserPlus, Bell, Target, Clock } from 'lucide-react';
import { Notification } from '../../types/notification';
import { formatTimeAgo } from '../../utils/helpers';
import { userService } from '../../services/userService';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete?: (id: number) => void;
  userNames?: Record<number, string>;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  userNames
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return <UserPlus className="text-blue-500" size={16} />;
      case 'FRIEND_REQUEST_RESPONSE':
        return <UserPlus className="text-green-500" size={16} />;
      case 'GOAL_COMPLETED':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'GOAL_COMPLETED_BY_FRIEND':
        return <Target className="text-purple-500" size={16} />;
      case 'GOAL_ASSIGNED':
        return <Bell className="text-yellow-500" size={16} />;
      case 'GOAL_MISSED':
        return <Clock className="text-red-500" size={16} />;
      
      case 'CHALLENGE_RECEIVED':
  return <Target className="text-purple-500" size={16} />;
case 'CHALLENGE_RESPONSE':
  return <CheckCircle className="text-green-500" size={16} />;

      default:
        return <Bell className="text-gray-400" size={16} />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST':
      case 'FRIEND_REQUEST_RESPONSE':
        return 'bg-blue-50 border-blue-200';
      case 'GOAL_COMPLETED':
      case 'GOAL_COMPLETED_BY_FRIEND':
        return 'bg-green-50 border-green-200';
      case 'GOAL_ASSIGNED':
        return 'bg-yellow-50 border-yellow-200';
      case 'GOAL_MISSED':
        return 'bg-red-50 border-red-200';
      case 'CHALLENGE_RECEIVED':
case 'CHALLENGE_RESPONSE':
  return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`relative p-4 rounded-lg border transition-all cursor-pointer ${
        notification.seen 
          ? 'bg-gray-50 border-gray-200 opacity-75' 
          : getNotificationBg(notification.type)
      }`}
      onClick={() => !notification.seen && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          notification.seen ? 'bg-gray-200' : 'bg-white shadow-sm'
        }`}>
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${
            notification.seen ? 'text-gray-600' : 'text-gray-900'
          }`}>
            {notification.type === 'GOAL_COMPLETED_BY_FRIEND' && notification.sourceUserId && userNames
              ? (() => {
                  const username = userNames[notification.sourceUserId];
                  console.log('NotificationItem - userNames:', userNames, 'sourceUserId:', notification.sourceUserId, 'username:', username, 'message:', notification.message);
                  return notification.message.replace('{username}', username || 'A friend');
                })()
              : notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>

        {/* Unread indicator */}
        {!notification.seen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"
          />
        )}

        {/* Delete button */}
        {onDelete && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 hover:bg-red-100 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
          >
            ×
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
