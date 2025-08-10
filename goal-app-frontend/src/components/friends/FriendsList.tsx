import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Target, MessageCircle, Zap, Crown, Star, Users as UsersIcon } from 'lucide-react';
import { MotionCard } from '../common/MotionCard';
import { AnimatedButton } from '../common/AnimatedButton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChallengeModal } from './ChallengeModal';

interface Friend {
  id: number;
  username: string;
  points: number;
  completedGoals: number;
  isOnline: boolean;
}

interface FriendsListProps {
  friends: Friend[];
  onChallenge?: (friendId: number, friendUsername: string) => void;
  onViewProfile?: (friendId: number) => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({ 
  friends, 
  onChallenge, 
  onViewProfile 
}) => {
  const navigate = useNavigate();
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const handleChallenge = (friendId: number, friendUsername: string) => {
    if (onChallenge) {
      onChallenge(friendId, friendUsername);
    } else {
      // ✅ Find friend and set state properly
      const friend = friends.find(f => f.id === friendId);
      if (friend) {
        setSelectedFriend(friend);
        setShowChallengeModal(true);
      }
    }
  };

  const handleChallengeSent = () => {
    setShowChallengeModal(false); // ✅ Close modal after sending
    setSelectedFriend(null); // ✅ Clear selected friend
    toast.success('Challenge sent successfully!');
  };

  const handleCloseModal = () => {
    setShowChallengeModal(false);
    setSelectedFriend(null);
  };

  const handleViewProfile = (friendId: number) => {
    if (onViewProfile) {
      onViewProfile(friendId);
    } else {
      toast.info('Viewing friend profile...');
      navigate(`/profile/${friendId}`);
    }
  };

  if (friends.length === 0) {
    return (
      <MotionCard className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200">
        <div className="text-center py-16">
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            👥
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No friends yet!</h3>
          <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
            Start building your goal-achieving community by connecting with like-minded people.
          </p>
          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/friends')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            >
              <UsersIcon size={24} />
              <span>Find Friends</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </motion.button>
          </div>
          
          {/* Benefits Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="text-blue-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Shared Goals</h4>
              <p className="text-sm text-gray-600">Create and achieve goals together</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="text-purple-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Competition</h4>
              <p className="text-sm text-gray-600">Friendly rivalry to stay motivated</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="text-pink-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
              <p className="text-sm text-gray-600">Encourage each other's success</p>
            </div>
          </div>
        </div>
      </MotionCard>
    );
  }

  return (
    <>
      {/* Enhanced Friends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.map((friend, index) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: index * 0.1,
              type: 'spring',
              stiffness: 100,
              damping: 10
            }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group"
          >
            <MotionCard className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-purple-50 border-2 border-blue-100 hover:border-purple-200 transition-all duration-300">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transform translate-x-8 -translate-y-8" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transform -translate-x-4 translate-y-4" />
              </div>

              <div className="relative text-center p-6">
                {/* Avatar Section */}
                <div className="relative inline-block mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                  >
                    {friend.username.charAt(0).toUpperCase()}
                  </motion.div>
                  
                  {/* Online Status */}
                  {friend.isOnline && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center"
                    >
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                  )}
                  
                  {/* Top Performer Badge */}
                  {friend.points > 200 && (
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -top-2 -right-2"
                    >
                      <Crown size={20} className="text-yellow-500" />
                    </motion.div>
                  )}
                </div>
                
                {/* Friend Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{friend.username}</h3>
                
                {/* Stats */}
                <div className="flex justify-center space-x-6 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="flex items-center space-x-1 bg-yellow-100 px-3 py-1 rounded-full">
                      <Trophy size={16} className="text-yellow-600" />
                      <span className="font-bold text-yellow-700">{friend.points}</span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">Points</span>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
                      <Target size={16} className="text-green-600" />
                      <span className="font-bold text-green-700">{friend.completedGoals}</span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">Goals</span>
                  </motion.div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChallenge(friend.id, friend.username)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Zap size={16} />
                    <span>Challenge</span>
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      ⚔️
                    </motion.div>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewProfile(friend.id)}
                    className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  >
                    <User size={16} />
                  </motion.button>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 pointer-events-none"
              />
            </MotionCard>
          </motion.div>
        ))}
      </div>

      {/* ✅ Modal rendered ONCE outside the map */}
      {selectedFriend && (
        <ChallengeModal
          isOpen={showChallengeModal}
          friendId={selectedFriend.id}
          friendName={selectedFriend.username}
          onClose={handleCloseModal}
          onChallengeSent={handleChallengeSent}
        />
      )}
    </>
  );
};
