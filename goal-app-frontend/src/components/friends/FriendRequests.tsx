import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Check, X, Clock } from 'lucide-react';
import { MotionCard } from '../common/MotionCard';
import { AnimatedButton } from '../common/AnimatedButton';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface FriendRequest {
  id: number;
  fromUserId: number;
  fromUsername: string;
  toUserId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  respondedAt?: string;
}

interface FriendRequestsProps {
  requests: FriendRequest[];
  onUpdate: () => void;
}

export const FriendRequests: React.FC<FriendRequestsProps> = ({ requests, onUpdate }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const handleRespond = async (requestId: number, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.put(`/friend-requests/${requestId}/respond?userId=${user?.id}&status=${status}`);
      toast.success(status === 'ACCEPTED' ? 'Friend request accepted! 🎉' : 'Friend request rejected');
      onUpdate();
    } catch (error) {
      toast.error('Failed to respond to friend request');
    }
  };

  if (requests.length === 0) {
    return (
      <MotionCard>
        <div className="text-center py-12">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            📫
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Requests</h3>
          <p className="text-gray-600 mb-6">
            You have no pending friend requests at the moment.
          </p>
          <p className="text-sm text-gray-500">
            Invite friends to join your goal-achieving journey!
          </p>
        </div>
      </MotionCard>
    );
  }

  return (
    <MotionCard>
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <UserPlus className="mr-2" />
          Pending Friend Requests ({requests.length})
        </h3>
        
        <div className="space-y-4">
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {request.fromUsername.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{request.fromUsername}</p>
                  <p className="text-sm text-gray-600">Wants to be your goal buddy</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock size={12} className="mr-1" />
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <AnimatedButton
                  variant="success"
                  size="sm"
                  onClick={() => handleRespond(request.id, 'ACCEPTED')}
                  className="flex items-center"
                >
                  <Check size={16} className="mr-1" />
                  Accept
                </AnimatedButton>
                
                <AnimatedButton
                  variant="danger"
                  size="sm"
                  onClick={() => handleRespond(request.id, 'REJECTED')}
                  className="flex items-center"
                >
                  <X size={16} className="mr-1" />
                  Decline
                </AnimatedButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MotionCard>
  );
};
