import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Clock, Target } from 'lucide-react';
import { Challenge, challengeService } from '../../services/challengeService';
import { MotionCard } from '../common/MotionCard';
import { AnimatedButton } from '../common/AnimatedButton';
import { useAppSelector } from '../../hooks/reduxHooks';
import { toast } from 'react-toastify';
import { formatTimeAgo } from '../../utils/helpers';

export const ChallengeNotifications: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [pendingChallenges, setPendingChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadPendingChallenges();
    }
  }, [user]);

  const loadPendingChallenges = async () => {
    try {
      setLoading(true);
      const challenges = await challengeService.getPendingChallenges(user!.id);
      setPendingChallenges(challenges);
    } catch (error) {
      console.error('Failed to load pending challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeResponse = async (challengeId: number, response: 'ACCEPT' | 'REJECT') => {
    try {
      setResponding(challengeId);
      
      await challengeService.respondToChallenge(challengeId, user!.id, response);
      
      toast.success(
        response === 'ACCEPT' 
          ? 'Challenge accepted! 🎯 Shared goal created!' 
          : 'Challenge declined'
      );
      
      // Remove from pending list
      setPendingChallenges(prev => prev.filter(c => c.id !== challengeId));
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to respond to challenge');
    } finally {
      setResponding(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (pendingChallenges.length === 0) {
    return (
      <MotionCard className="text-center py-8">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending challenges</h3>
        <p className="text-gray-600">Challenge your friends to create shared goals!</p>
      </MotionCard>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {pendingChallenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ delay: index * 0.1 }}
          >
            <MotionCard className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Challenge Header */}
                  <div className="flex items-center mb-3">
                    <Target className="text-blue-600 mr-2" size={20} />
                    <h3 className="text-lg font-bold text-gray-900">
                      {challenge.title}
                    </h3>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      challenge.difficulty === 'EASY' ? 'bg-green-100 text-green-600' :
                      challenge.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {challenge.difficulty}
                    </span>
                  </div>

                  {/* Challenge Info */}
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">From:</span> {challenge.challengerName || 'Friend'}
                  </p>
                  
                  {challenge.description && (
                    <p className="text-gray-700 mb-3">{challenge.description}</p>
                  )}

                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      Deadline: {new Date(challenge.deadline).toLocaleDateString()}
                    </div>
                    <div>
                      Received {formatTimeAgo(challenge.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 ml-6">
                  <AnimatedButton
                    variant="success"
                    size="sm"
                    onClick={() => handleChallengeResponse(challenge.id, 'ACCEPT')}
                    disabled={responding === challenge.id}
                    className="flex items-center"
                  >
                    {responding === challenge.id ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <CheckCircle size={16} className="mr-1" />
                    )}
                    Accept
                  </AnimatedButton>

                  <AnimatedButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleChallengeResponse(challenge.id, 'REJECT')}
                    disabled={responding === challenge.id}
                    className="flex items-center"
                  >
                    <X size={16} className="mr-1" />
                    Decline
                  </AnimatedButton>
                </div>
              </div>
            </MotionCard>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
