import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  CheckCircle, 
  UserPlus, 
  Target, 
  Trophy,
  Clock,
  Calendar
} from 'lucide-react';
import { MotionCard } from '../common/MotionCard';
import { formatTimeAgo } from '../../utils/helpers';

interface ActivityItem {
  id: number;
  type: 'goal_completed' | 'friend_added' | 'goal_created' | 'achievement' | 'missed_goal';
  message: string;
  timestamp: string;
  points?: number;
  icon?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  showEmpty?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ 
  activities, 
  showEmpty = true 
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'goal_completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'friend_added':
        return <UserPlus className="text-blue-500" size={20} />;
      case 'goal_created':
        return <Target className="text-purple-500" size={20} />;
      case 'achievement':
        return <Trophy className="text-yellow-500" size={20} />;
      case 'missed_goal':
        return <Clock className="text-red-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getActivityBg = (type: ActivityItem['type']) => {
    switch (type) {
      case 'goal_completed':
        return 'bg-green-50 border-green-200';
      case 'friend_added':
        return 'bg-blue-50 border-blue-200';
      case 'goal_created':
        return 'bg-purple-50 border-purple-200';
      case 'achievement':
        return 'bg-yellow-50 border-yellow-200';
      case 'missed_goal':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <MotionCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Calendar className="mr-2 text-blue-600" />
          Recent Activity
        </h3>
        {activities.length > 0 && (
          <span className="text-sm text-gray-500">
            {activities.length} recent {activities.length === 1 ? 'activity' : 'activities'}
          </span>
        )}
      </div>

      {activities.length === 0 ? (
        showEmpty && (
          <div className="text-center py-8">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              📊
            </motion.div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No Recent Activity
            </h4>
            <p className="text-gray-600 mb-4">
              Start completing goals and connecting with friends to see your activity here!
            </p>
          </div>
        )
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityBg(activity.type)}`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {activity.message}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                  {activity.points && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      +{activity.points} pts
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View All Button */}
      {activities.length > 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4"
        >
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            View All Activity →
          </button>
        </motion.div>
      )}
    </MotionCard>
  );
};
