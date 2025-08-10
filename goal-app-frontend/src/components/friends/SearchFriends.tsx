import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Users, Zap, CheckCircle, Star, Trophy, Target, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { MotionCard } from '../common/MotionCard';
import { AnimatedButton } from '../common/AnimatedButton';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface User {
  id: number;
  username: string;
  email: string;
  points: number;
  createdAt: string;
}

export const SearchFriends: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<number>>(new Set());

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/users/search?query=${searchTerm}`);
      // Filter out current user from results
      const filteredResults = response.data.filter((u: User) => u.id !== user?.id);
      setResults(filteredResults);
    } catch (error) {
      toast.error('Failed to search users');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (toUserId: number) => {
    try {
      await api.post(`/friend-requests/send?fromUserId=${user?.id}&toUserId=${toUserId}`);
      setSentRequests(prev => new Set([...Array.from(prev), toUserId]));
      toast.success('Friend request sent! 🚀');
    } catch (error) {
      toast.error('Failed to send friend request');
    }
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      const debounce = setTimeout(handleSearch, 500);
      return () => clearTimeout(debounce);
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  return (
    <div className="space-y-8">
      {/* Enhanced Search Section */}
      <MotionCard className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200">
        <div className="p-8">
          <div className="text-center mb-8">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              🔍
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Goal Buddies</h3>
            <p className="text-gray-600 text-lg">
              Connect with like-minded achievers and build your success network
            </p>
          </div>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-xl border-2 border-white">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-16 py-6 rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all text-lg font-medium placeholder-gray-400"
              />
              {loading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2"
                >
                  <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full"></div>
                </motion.div>
              )}
              {!loading && searchTerm && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2"
                >
                  <Sparkles className="text-purple-500" size={24} />
                </motion.div>
              )}
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-6"
          >
            <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200">
              <span className="text-2xl">💡</span>
              <span className="text-sm font-medium text-gray-700">
                Search for friends by their username or email to start achieving goals together!
              </span>
            </div>
          </motion.div>
        </div>
      </MotionCard>

      {/* Enhanced Results Section */}
      {searchTerm && (
        <MotionCard className="bg-gradient-to-br from-white to-blue-50 border border-blue-200">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-gray-900 flex items-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="mr-3"
                >
                  🎯
                </motion.div>
                Search Results {results.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    {results.length} found
                  </span>
                )}
              </h4>
            </div>
            
            {results.length === 0 && !loading ? (
              <div className="text-center py-16">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-6"
                >
                  🔍
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500 text-lg mb-2">No users found matching "{searchTerm}"</p>
                <p className="text-sm text-gray-400">Try a different search term or check the spelling</p>
                
                <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">💡 Search Tips</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Try searching by exact username</li>
                    <li>• Use the full email address</li>
                    <li>• Check for typos in your search</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((searchUser, index) => (
                  <motion.div
                    key={searchUser.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 100,
                      damping: 10
                    }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="group"
                  >
                    <div className="relative overflow-hidden bg-gradient-to-r from-white via-blue-50 to-purple-50 rounded-2xl border-2 border-blue-100 hover:border-purple-200 transition-all duration-300 shadow-lg hover:shadow-xl">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transform translate-x-16 -translate-y-16" />
                      </div>

                      <div className="relative p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            {/* Enhanced Avatar */}
                            <div className="relative">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-16 h-16 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                              >
                                {searchUser.username.charAt(0).toUpperCase()}
                              </motion.div>
                              
                              {/* Achievement Badge */}
                              {searchUser.points > 100 && (
                                <motion.div
                                  animate={{ rotate: [0, 10, -10, 0] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                  className="absolute -top-1 -right-1"
                                >
                                  <Star size={16} className="text-yellow-500" />
                                </motion.div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{searchUser.username}</h3>
                              <p className="text-sm text-gray-600 mb-2">{searchUser.email}</p>
                              
                              {/* Enhanced Stats */}
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1 bg-yellow-100 px-3 py-1 rounded-full">
                                  <Trophy size={14} className="text-yellow-600" />
                                  <span className="text-xs font-bold text-yellow-700">{searchUser.points} pts</span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  Joined {new Date(searchUser.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Action Button */}
                          <div className="flex items-center ml-4">
                            {sentRequests.has(searchUser.id) ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-6 py-3 rounded-xl font-bold shadow-md border border-green-200"
                              >
                                <CheckCircle size={18} className="mr-2" />
                                Request Sent
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="ml-2"
                                >
                                  ✨
                                </motion.div>
                              </motion.div>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAddFriend(searchUser.id)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                              >
                                <UserPlus size={18} />
                                <span>Add Friend</span>
                                <motion.div
                                  animate={{ x: [0, 3, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  →
                                </motion.div>
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Hover Glow Effect */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 pointer-events-none"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </MotionCard>
      )}

      {/* Enhanced Tips Section */}
      {!searchTerm && (
        <MotionCard className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-200">
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-4xl mb-4"
              >
                🤝
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Why Add Friends?</h3>
              <p className="text-gray-600 text-lg">
                Building connections amplifies your success and makes achieving goals more fun!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Target,
                  color: 'blue',
                  title: 'Shared Goals',
                  description: 'Create goals together and achieve them as a team',
                  emoji: '🎯'
                },
                {
                  icon: Trophy,
                  color: 'green',
                  title: 'Accountability',
                  description: 'Stay motivated with friendly competition',
                  emoji: '🏆'
                },
                {
                  icon: Users,
                  color: 'purple',
                  title: 'Leaderboards',
                  description: 'Compete on points and celebrate success',
                  emoji: '📊'
                },
                {
                  icon: Sparkles,
                  color: 'yellow',
                  title: 'Notifications',
                  description: 'Get notified when friends complete goals',
                  emoji: '🔔'
                }
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group"
                >
                  <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-r from-${benefit.color}-400 to-${benefit.color}-500 rounded-full transform translate-x-8 -translate-y-8`} />
                    </div>

                    <div className="relative">
                      <div className="flex items-center space-x-4 mb-4">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`w-12 h-12 bg-gradient-to-r from-${benefit.color}-100 to-${benefit.color}-200 rounded-full flex items-center justify-center`}
                        >
                          <benefit.icon className={`text-${benefit.color}-600`} size={24} />
                        </motion.div>
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                          className="text-2xl"
                        >
                          {benefit.emoji}
                        </motion.div>
                      </div>
                      
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h4>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>

                    {/* Hover Glow Effect */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className={`absolute inset-0 bg-gradient-to-r from-${benefit.color}-400/10 to-${benefit.color}-500/10 pointer-events-none`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-8"
            >
              <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full border border-purple-200">
                <span className="text-2xl">🚀</span>
                <span className="font-medium text-gray-700">
                  Start searching above to find your goal-achieving partners!
                </span>
              </div>
            </motion.div>
          </div>
        </MotionCard>
      )}
    </div>
  );
};
