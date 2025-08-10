import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { Header } from '../components/common/Header';
import { MotionCard } from '../components/common/MotionCard';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { leaderboardService, LeaderboardUser } from '../services/leaderboardService';
import { useAppSelector } from '../hooks/reduxHooks';
import { RootState } from '../store';
import { toast } from 'react-toastify';

export const Leaderboard: React.FC = () => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [topPerformers, setTopPerformers] = useState<LeaderboardUser[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<{ rank: number; totalUsers: number; percentile: number } | null>(null);
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'allTime'>('allTime');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadLeaderboardData();
    }
  }, [user, timeFilter]);

  const loadLeaderboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('🔄 Loading leaderboard data for user:', user.username);
      
      const [
        globalLeaderboard,
        topPerformersData,
        friendsData,
        userRankData
      ] = await Promise.allSettled([
        leaderboardService.getGlobalLeaderboard(50, timeFilter),
        leaderboardService.getTopPerformers(3, timeFilter),
        leaderboardService.getFriendsLeaderboard(user.id, 10),
        leaderboardService.getUserRank(user.id)
      ]);

      console.log('📊 API Results:', {
        globalLeaderboard: globalLeaderboard.status,
        topPerformersData: topPerformersData.status,
        friendsData: friendsData.status,
        userRankData: userRankData.status
      });

      if (globalLeaderboard.status === 'fulfilled') {
        console.log('✅ Global leaderboard data:', globalLeaderboard.value);
        setLeaderboardData(globalLeaderboard.value.users || []);
      } else {
        console.error('❌ Global leaderboard failed:', globalLeaderboard.reason);
      }

      if (topPerformersData.status === 'fulfilled') {
        console.log('✅ Top performers data:', topPerformersData.value);
        setTopPerformers(topPerformersData.value || []);
      } else {
        console.error('❌ Top performers failed:', topPerformersData.reason);
      }

      if (friendsData.status === 'fulfilled') {
        console.log('✅ Friends data:', friendsData.value);
        setFriendsLeaderboard(friendsData.value || []);
      } else {
        console.error('❌ Friends data failed:', friendsData.reason);
      }

      if (userRankData.status === 'fulfilled') {
        console.log('✅ User rank data:', userRankData.value);
        setUserRank(userRankData.value);
      } else {
        console.error('❌ User rank failed:', userRankData.reason);
        // Fallback user rank if API fails
        setUserRank({
          rank: 1,
          totalUsers: 1,
          percentile: 100
        });
      }

    } catch (error) {
      console.error('Failed to load leaderboard data:', error);
      toast.error('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboardData();
    setRefreshing(false);
    toast.success('Leaderboard refreshed! 🏆');
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Award className="text-orange-500" size={24} />;
      default:
        return <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">{rank}</div>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-orange-500';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-red-500';
      default:
        return 'from-blue-400 to-purple-500';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                <Trophy className="mr-3 text-yellow-400" />
                Leaderboard
              </h1>
              <p className="text-white/70 text-lg">
                See how you stack up against other goal achievers
              </p>
            </div>
            
            {/* Refresh Button */}
            <AnimatedButton
              onClick={handleRefresh}
              disabled={refreshing}
              variant="secondary"
              className="flex items-center"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </AnimatedButton>
          </div>
        </motion.div>

        {/* Time Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <MotionCard className="p-4">
            <div className="flex space-x-2">
              {(['weekly', 'monthly', 'allTime'] as const).map((filter) => (
                <motion.button
                  key={filter}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    timeFilter === filter
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter === 'weekly' && 'This Week'}
                  {filter === 'monthly' && 'This Month'}
                  {filter === 'allTime' && 'All Time'}
                </motion.button>
              ))}
            </div>
          </MotionCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Top 3 Podium */}
          <div className="lg:col-span-3">
            {/* Podium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <MotionCard className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">🏆 Top Performers</h2>
                
                {topPerformers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No leaderboard data yet!</h3>
                    <p className="text-gray-600">Complete some goals to see the leaderboard.</p>
                  </div>
                ) : (
                  <div className="flex items-end justify-center space-x-4">
                    {/* Second Place */}
                    {topPerformers[1] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                      >
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                          {topPerformers[1].username.charAt(0)}
                        </div>
                        <div className="bg-gradient-to-r from-gray-300 to-gray-500 text-white px-4 py-8 rounded-t-lg">
                          <Medal className="mx-auto mb-2 text-silver" size={24} />
                          <p className="font-bold">{topPerformers[1].username}</p>
                          <p className="text-sm">{topPerformers[1].points} pts</p>
                        </div>
                      </motion.div>
                    )}

                    {/* First Place */}
                    {topPerformers[0] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center"
                      >
                        <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-2">
                          {topPerformers[0].username.charAt(0)}
                        </div>
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-12 rounded-t-lg">
                          <Crown className="mx-auto mb-2" size={28} />
                          <p className="font-bold text-lg">{topPerformers[0].username}</p>
                          <p className="text-sm">{topPerformers[0].points} pts</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Third Place */}
                    {topPerformers[2] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center"
                      >
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                          {topPerformers[2].username.charAt(0)}
                        </div>
                        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-6 rounded-t-lg">
                          <Award className="mx-auto mb-2" size={24} />
                          <p className="font-bold">{topPerformers[2].username}</p>
                          <p className="text-sm">{topPerformers[2].points} pts</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </MotionCard>
            </motion.div>

            {/* Full Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <MotionCard>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <TrendingUp className="mr-2" />
                    Full Rankings
                  </h3>
                  
                  <div className="space-y-3">
                    {leaderboardData.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            {getRankIcon(user.rank)}
                          </div>
                          
                          <div className={`w-12 h-12 bg-gradient-to-r ${getRankColor(user.rank)} rounded-full flex items-center justify-center text-white font-bold`}>
                            {user.username.charAt(0)}
                          </div>
                          
                          <div>
                            <p className="font-bold text-gray-900">{user.username}</p>
                            <p className="text-sm text-gray-600">
                              {user.completedGoals} goals • {user.streak} day streak
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{user.points}</p>
                          <p className="text-sm text-gray-600">points</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </MotionCard>
            </motion.div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <MotionCard>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Rank</h3>
                  <div className="text-center">
                    {userRank ? (
                      <>
                        <div className="text-4xl font-bold text-blue-600 mb-2">#{userRank.rank}</div>
                        <p className="text-gray-600 mb-4">Out of {userRank.totalUsers} users</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${userRank.percentile}%` }}
                            transition={{ delay: 1, duration: 1 }}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Top {Math.round(100 - userRank.percentile)}%</p>
                      </>
                    ) : (
                      <div className="py-8">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-gray-600">Loading rank...</p>
                      </div>
                    )}
                  </div>
                </div>
              </MotionCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <MotionCard>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Challenge</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Complete 3 goals</span>
                      <span className="font-bold text-green-600">2/3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '66%' }}
                        transition={{ delay: 1.2, duration: 1 }}
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                      />
                    </div>
                    <p className="text-sm text-gray-600">Reward: 50 bonus points</p>
                  </div>
                </div>
              </MotionCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <MotionCard>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="mr-2" size={20} />
                    Friends Leaderboard
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-white font-bold">1</div>
                        <span className="text-sm">You</span>
                      </div>
                      <span className="font-bold text-sm">290</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white font-bold">2</div>
                        <span className="text-sm">Friend1</span>
                      </div>
                      <span className="font-bold text-sm">275</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white font-bold">3</div>
                        <span className="text-sm">Friend2</span>
                      </div>
                      <span className="font-bold text-sm">220</span>
                    </div>
                  </div>
                </div>
              </MotionCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
