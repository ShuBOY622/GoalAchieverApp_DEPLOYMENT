import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X, Clock, Target, User } from 'lucide-react';
import { AnimatedButton } from '../common/AnimatedButton';
import { challengeService } from '../../services/challengeService';
import { useAppSelector } from '../../hooks/reduxHooks';
import { toast } from 'react-toastify';
import { formatTimeAgo } from '../../utils/helpers';

interface ChallengeNotificationItemProps {
  notification: {
    id: number;
    type: string;
    message: string;
    relatedId: number; // Challenge ID
    sourceUserId: number; // Challenger user ID
    timestamp: string;
    seen: boolean;
  };
  onResponse: (notificationId: number) => void;
}

export const ChallengeNotificationItem: React.FC<ChallengeNotificationItemProps> = ({
  notification,
  onResponse
}) => {
  const { user } = useAppSelector(state => state.auth);
  const [responding, setResponding] = useState(false);

  const handleChallengeResponse = async (response: 'ACCEPT' | 'REJECT') => {
  try {
    setResponding(true);
    
    // Call challenge service to respond
    await challengeService.respondToChallenge(
      notification.relatedId,
      user!.id,
      response
    );

    // ✅ Trigger dashboard refresh after successful acceptance
    if (response === 'ACCEPT') {
      // Option 1: Use custom event to notify dashboard
      window.dispatchEvent(new CustomEvent('challengeAccepted', {
        detail: { challengeId: notification.relatedId }
      }));
      
      // Option 2: Add delay to allow backend processing, then refresh
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshDashboard'));
      }, 2000); // 2 second delay for backend processing
    }

    toast.success(
      response === 'ACCEPT' 
        ? 'Challenge accepted! 🎯 Shared goal created!' 
        : 'Challenge declined'
    );

    onResponse(notification.id);
    
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to respond to challenge');
  } finally {
    setResponding(false);
  }
};


  // Only show accept/reject buttons for challenge received notifications
  const showResponseButtons = notification.type === 'CHALLENGE_RECEIVED' && !notification.seen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 border rounded-lg ${
        notification.seen ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Challenge Icon */}
          <div className="p-2 bg-purple-100 rounded-full">
            <Target className="text-purple-600" size={16} />
          </div>

          <div className="flex-1">
            {/* Notification Message */}
            <p className="font-medium text-gray-900 mb-2">
              {notification.message}
            </p>

            {/* Metadata */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Clock size={12} className="mr-1" />
                {formatTimeAgo(notification.timestamp)}
              </div>
              <div className="flex items-center">
                <User size={12} className="mr-1" />
                From User {notification.sourceUserId}
              </div>
            </div>
          </div>
        </div>

        {/* Response Buttons */}
        {showResponseButtons && (
          <div className="flex items-center space-x-2 ml-4">
            <AnimatedButton
              variant="success"
              size="sm"
              onClick={() => handleChallengeResponse('ACCEPT')}
              disabled={responding}
              className="flex items-center"
            >
              {responding ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <CheckCircle size={14} className="mr-1" />
              )}
              Accept
            </AnimatedButton>

            <AnimatedButton
              variant="danger"
              size="sm"
              onClick={() => handleChallengeResponse('REJECT')}
              disabled={responding}
              className="flex items-center"
            >
              <X size={14} className="mr-1" />
              Decline
            </AnimatedButton>
          </div>
        )}
      </div>

      {/* Show if already responded */}
      {notification.seen && notification.type === 'CHALLENGE_RECEIVED' && (
        <div className="mt-3 text-sm text-gray-600">
          ✅ You have already responded to this challenge
        </div>
      )}
    </motion.div>
  );
};
