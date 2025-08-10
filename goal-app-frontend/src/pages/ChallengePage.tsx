import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Send, Clock, CheckCircle, X, Users, Zap, Crown, Trophy, Sparkles, Swords } from 'lucide-react';
import { Header } from '../components/common/Header';
import { MotionCard } from '../components/common/MotionCard';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { ChallengeModal } from '../components/friends/ChallengeModal';
import { useAppSelector } from '../hooks/reduxHooks';
import { challengeService } from '../services/challengeService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

interface Challenge {
  id: number;
  challengerId: number;
  challengedUserId: number;
  title: string;
  description?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  deadline: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  challengerName?: string;
  challengedUserName?: string;
}

export const ChallengesPage: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedChallenges, setReceivedChallenges] = useState<Challenge[]>([]);
  const [sentChallenges, setSentChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      console.log('Loading challenges for user:', user!.id);
      
      const [receivedResult, sentResult] = await Promise.allSettled([
        challengeService.getPendingChallenges(user!.id),
        challengeService.getSentChallenges(user!.id)
      ]);
      
      // Handle received challenges
      if (receivedResult.status === 'fulfilled') {
        console.log('Received challenges:', receivedResult.value);
        setReceivedChallenges(receivedResult.value);
      } else {
        console.error('Failed to load received challenges:', receivedResult.reason);
        setReceivedChallenges([]);
      }
      
      // Handle sent challenges
      if (sentResult.status === 'fulfilled') {
        console.log('Sent challenges:', sentResult.value);
        setSentChallenges(sentResult.value);
      } else {
        console.error('Failed to load sent challenges:', sentResult.reason);
        setSentChallenges([]);
        toast.error('Failed to load sent challenges');
      }
      
    } catch (error) {
      console.error('Failed to load challenges:', error);
      toast.error('Failed to load challenges');
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
      
      // Refresh challenges
      await loadChallenges();
      
      // ✅ Trigger notification refresh
      if (response === 'ACCEPT') {
        window.dispatchEvent(new CustomEvent('challengeAccepted', {
          detail: { challengeId }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('challengeRejected', {
          detail: { challengeId }
        }));
      }
      
      // ✅ Refresh notifications after a delay to allow backend processing
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }, 2000);
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to respond to challenge');
    } finally {
      setResponding(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-600';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-600';
      case 'HARD': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-600';
      case 'ACCEPTED': return 'bg-green-100 text-green-600';
      case 'REJECTED': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-400 to-red-500 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Enhanced Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center">
              <motion.div
                animate={{
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                ⚔️
              </motion.div>
              <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Challenge Center
              </h1>
              <p className="text-blue-200 text-xl">
                Manage your challenge invitations and track your competitive progress
              </p>
              
              {/* Stats */}
              <div className="flex justify-center space-x-6 mt-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30"
                >
                  <div className="flex items-center space-x-2">
                    <Users className="text-blue-300" size={20} />
                    <span className="text-white font-medium">
                      {receivedChallenges.filter(c => c.status === 'PENDING').length} Pending
                    </span>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30"
                >
                  <div className="flex items-center space-x-2">
                    <Send className="text-purple-300" size={20} />
                    <span className="text-white font-medium">
                      {sentChallenges.length} Sent
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <MotionCard className="p-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg border border-white/20">
            <div className="flex">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('received')}
                className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
                  activeTab === 'received'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-800 hover:bg-white/20 hover:text-gray-900 border border-white/30'
                }`}
              >
                <Users size={20} />
                <span>Received</span>
                <div className={`px-2 py-1 rounded-full text-sm font-bold ${
                  activeTab === 'received' ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {receivedChallenges.filter(c => c.status === 'PENDING').length}
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('sent')}
                className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
                  activeTab === 'sent'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-800 hover:bg-white/20 hover:text-gray-900 border border-white/30'
                }`}
              >
                <Send size={20} />
                <span>Sent</span>
                <div className={`px-2 py-1 rounded-full text-sm font-bold ${
                  activeTab === 'sent' ? 'bg-white/20 text-white' : 'bg-purple-600 text-white'
                }`}>
                  {sentChallenges.length}
                </div>
              </motion.button>
            </div>
          </MotionCard>
        </motion.div>

        {/* Challenge Lists */}
        {activeTab === 'received' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {receivedChallenges.length === 0 ? (
              <MotionCard className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200">
                <div className="text-center py-16">
                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-8xl mb-6"
                  >
                    🎯
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No challenges received</h3>
                  <p className="text-gray-600 text-lg mb-8">
                    When friends send you challenges, they'll appear here for you to accept or decline.
                  </p>
                  
                  {/* Benefits of Challenges */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="p-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Swords className="text-purple-600" size={24} />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Friendly Competition</h4>
                      <p className="text-sm text-gray-600">Challenge friends to shared goals</p>
                    </div>
                    <div className="p-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Trophy className="text-blue-600" size={24} />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Earn More Points</h4>
                      <p className="text-sm text-gray-600">Shared goals give bonus rewards</p>
                    </div>
                    <div className="p-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="text-green-600" size={24} />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Stay Motivated</h4>
                      <p className="text-sm text-gray-600">Accountability with friends</p>
                    </div>
                  </div>
                </div>
              </MotionCard>
            ) : (
              receivedChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MotionCard className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-purple-50 border-2 border-blue-200 hover:border-purple-300 transition-all duration-300">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transform translate-x-16 -translate-y-16" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transform -translate-x-8 translate-y-8" />
                    </div>

                    <div className="relative p-8">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Challenge Header */}
                          <div className="flex items-center space-x-3 mb-4">
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                              className="text-2xl"
                            >
                              ⚔️
                            </motion.div>
                            <h3 className="text-xl font-bold text-gray-900">{challenge.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getDifficultyColor(challenge.difficulty)}`}>
                              {challenge.difficulty}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(challenge.status)}`}>
                              {challenge.status}
                            </span>
                          </div>

                          {challenge.description && (
                            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-100 mb-4">
                              <p className="text-gray-700 font-medium">{challenge.description}</p>
                            </div>
                          )}

                          {/* Challenge Details */}
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg">
                              <Clock size={16} className="text-blue-600" />
                              <span className="font-medium">
                                Due: {format(new Date(challenge.deadline), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 bg-purple-100 px-3 py-2 rounded-lg">
                              <Users size={16} className="text-purple-600" />
                              <span className="font-medium">
                                From User {challenge.challengerId}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {challenge.status === 'PENDING' && (
                          <div className="flex items-center space-x-4 ml-8">
                            <motion.button
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleChallengeResponse(challenge.id, 'ACCEPT')}
                              disabled={responding === challenge.id}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                            >
                              {responding === challenge.id ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                              ) : (
                                <CheckCircle size={18} />
                              )}
                              <span>Accept Challenge</span>
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                🎯
                              </motion.div>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleChallengeResponse(challenge.id, 'REJECT')}
                              disabled={responding === challenge.id}
                              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                            >
                              <X size={18} />
                              <span>Decline</span>
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10 pointer-events-none"
                    />
                  </MotionCard>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'sent' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {sentChallenges.length === 0 ? (
              <MotionCard className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-200">
                <div className="text-center py-16">
                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, -10, 10, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-8xl mb-6"
                  >
                    🚀
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No challenges sent</h3>
                  <p className="text-gray-600 text-lg mb-8">
                    Ready to challenge your friends? Start some friendly competition!
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/friends?tab=friends'}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 mx-auto"
                  >
                    <Swords size={24} />
                    <span>Challenge Friends</span>
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ⚔️
                    </motion.div>
                  </motion.button>
                </div>
              </MotionCard>
            ) : (
              sentChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MotionCard className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-bold text-gray-900">{challenge.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
                            {challenge.status}
                          </span>
                        </div>

                        {challenge.description && (
                          <p className="text-gray-700 mb-3">{challenge.description}</p>
                        )}

                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            Deadline: {format(new Date(challenge.deadline), 'MMM dd, yyyy')}
                          </div>
                          <div>
                            To User {challenge.challengedUserId}
                          </div>
                          <div>
                            Sent {format(new Date(challenge.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </MotionCard>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
