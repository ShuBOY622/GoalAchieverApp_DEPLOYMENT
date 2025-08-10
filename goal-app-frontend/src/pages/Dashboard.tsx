import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { Header } from '../components/common/Header';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { GoalCard } from '../components/goals/GoalCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { goalService } from '../services/goalService';
import { friendService } from '../services/friendService';
import { notificationService } from '../services/notificationService';
import { userService } from '../services/userService';
import { challengeService } from '../services/challengeService';
import { leaderboardService } from '../services/leaderboardService';
import { Goal } from '../types/goal';
import { User } from '../types/user';
import { Notification } from '../types/notification';
import { toast } from 'react-toastify';
import { Plus, Target, Calendar, Users, TrendingUp, User as UserIcon, Zap, Trophy, Crown, Medal, Sparkles, Swords } from 'lucide-react'; // ✅ Added Swords icon
import { AnimatedButton } from '../components/common/AnimatedButton';
import { MotionCard } from '../components/common/MotionCard';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { refreshUser, updateUser, updateUserPoints } from '../store/authSlice';
import { useUserStats } from '../hooks/useUserStats';

interface DashboardStats {
  totalGoals: number;
  completedGoals: number;
  totalPoints: number;
  friendsCount: number;
  pendingGoals: number;
  overdueGoals: number;
  currentStreak: number;
  personalGoals: number; // ✅ Added
  sharedGoals: number;   // ✅ Added
  pendingChallenges: number; // ✅ Added for actual pending challenges
}

interface ActivityItem {
  id: number;
  type: 'goal_completed' | 'friend_added' | 'goal_created' | 'achievement' | 'missed_goal';
  message: string;
  timestamp: string;
  points?: number;
}

interface LeaderboardUser extends User {
  rank: number;
  completedGoals?: number;
  streak?: number;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  
  // State management
  const [goals, setGoals] = useState<Goal[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<{ rank: number; totalUsers: number; percentile: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeGoalTab, setActiveGoalTab] = useState<'all' | 'personal' | 'shared'>('all'); // ✅ Added tab state

  const [stats, setStats] = useState<DashboardStats>({
    totalGoals: 0,
    completedGoals: 0,
    totalPoints: 0,
    friendsCount: 0,
    pendingGoals: 0,
    overdueGoals: 0,
    currentStreak: 0,
    personalGoals: 0, // ✅ Added
    sharedGoals: 0,   // ✅ Added
    pendingChallenges: 0, // ✅ Added for actual pending challenges
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // ✅ Sync Redux user points with local stats state
  useEffect(() => {
    if (user && stats.totalPoints !== user.points) {
      setStats(prevStats => ({
        ...prevStats,
        totalPoints: user.points || 0
      }));
    }
  }, [user?.points]);

  const { refreshUserStats } = useUserStats();
  // Add this to your existing Dashboard component
useEffect(() => {
  if (!user) return;

  // Listen for challenge acceptance and dashboard refresh events
  const handleChallengeAccepted = (event: any) => {
    console.log('Challenge accepted, refreshing dashboard...', event.detail);
    // Instant updates for immediate responsiveness
    setTimeout(() => loadDashboardData(), 100);
  };

  const handleDashboardRefresh = () => {
    console.log('Manual dashboard refresh requested');
    // Instant updates for immediate responsiveness
    setTimeout(() => loadDashboardData(), 50);
  };

  const handleRefreshStats = () => {
    console.log('Stats refresh requested');
    // Instant updates for immediate responsiveness
    setTimeout(() => loadDashboardData(), 50);
  };

  // ✅ Add handler for when new notifications are received (including challenges)
  const handleNotificationsRefresh = () => {
    console.log('Notifications refreshed, updating dashboard to reflect new challenges...');
    // Instant updates for immediate responsiveness
    setTimeout(() => loadDashboardData(), 100);
  };

  // Add event listeners
  window.addEventListener('challengeAccepted', handleChallengeAccepted);
  window.addEventListener('refreshDashboard', handleDashboardRefresh);
  window.addEventListener('refreshStats', handleRefreshStats);
  window.addEventListener('refreshNotifications', handleNotificationsRefresh);
  
  return () => {
    // Cleanup event listeners
    window.removeEventListener('challengeAccepted', handleChallengeAccepted);
    window.removeEventListener('refreshDashboard', handleDashboardRefresh);
    window.removeEventListener('refreshStats', handleRefreshStats);
    window.removeEventListener('refreshNotifications', handleNotificationsRefresh);
  };
}, [user]); // Keep user dependency but ensure proper cleanup

  // ✅ Helper function to filter goals by type
  const getFilteredGoals = () => {
    switch (activeGoalTab) {
      case 'personal':
        return goals.filter(goal => goal.type === 'PERSONAL');
      case 'shared':
        return goals.filter(goal => goal.type === 'SHARED');
      default:
        return goals;
    }
  };

  // ✅ Helper function to get goal type styling
  const getGoalTypeInfo = (goal: Goal) => {
    if (goal.type === 'SHARED') {
      return {
        icon: <Users size={18} className="text-purple-600" />,
        badge: '🎯 Challenge Goal',
        badgeColor: 'bg-purple-100 text-purple-600',
        description: 'Shared with friend'
      };
    }
    return {
      icon: <UserIcon size={18} className="text-blue-600" />,
      badge: '👤 Personal Goal',
      badgeColor: 'bg-blue-100 text-blue-600',
      description: 'Your personal goal'
    };
  };

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch all data concurrently for better performance
      const [
        goalsData,
        friendsData,
        notificationsData,
        userStats,
        pendingChallengesData,
        userRankData,
      ] = await Promise.allSettled([
        goalService.getGoals(user.id),
        friendService.getFriends(user.id),
        notificationService.getUserNotifications(user.id),
        userService.getUserStats(user.id),
        challengeService.getPendingChallenges(user.id),
        leaderboardService.getUserRank(user.id),
      ]);

      // Process Goals Data
      const goals = goalsData.status === 'fulfilled' ? goalsData.value : [];
      setGoals(goals);

      // Process Friends Data
      const friends = friendsData.status === 'fulfilled' ? friendsData.value : [];
      setFriends(friends);

      // Process Notifications Data
      const notifications = notificationsData.status === 'fulfilled' ? notificationsData.value : [];
      setNotifications(notifications);

      // Process Pending Challenges Data
      const pendingChallenges = pendingChallengesData.status === 'fulfilled' ? pendingChallengesData.value : [];

      // ✅ Calculate goals by type
      const personalGoals = goals.filter(goal => goal.type === 'PERSONAL');
      const sharedGoals = goals.filter(goal => goal.type === 'SHARED');

      // Calculate comprehensive stats
      const completedGoals = goals.filter(goal => 
        goal.assignments.some(a => a.userId === user.id && a.status === 'COMPLETED')
      ).length;

      const pendingGoals = goals.filter(goal => 
        goal.assignments.some(a => a.userId === user.id && a.status === 'PENDING')
      ).length;

      const overdueGoals = goals.filter(goal => {
        const userAssignment = goal.assignments.find(a => a.userId === user.id);
        const isCompleted = userAssignment?.status === 'COMPLETED';
        return new Date(goal.deadline) < new Date() && !isCompleted;
      }).length;

      // Get user stats or use calculated values
      const statsData = userStats.status === 'fulfilled' ? userStats.value : null;

      setStats({
        totalGoals: goals.length,
        completedGoals,
        totalPoints: statsData?.totalPoints || user.points || 0,
        friendsCount: friends.length,
        pendingGoals,
        overdueGoals,
        currentStreak: statsData?.currentStreak || 0,
        personalGoals: personalGoals.length, // ✅ Added
        sharedGoals: sharedGoals.length,     // ✅ Added
        pendingChallenges: pendingChallenges.length, // ✅ Actual pending challenges count
      });

      // Process User Rank Data
      const userRankResult = userRankData.status === 'fulfilled' ? userRankData.value : null;
      setUserRank(userRankResult || { rank: 1, totalUsers: 1, percentile: 100 });

      // Generate recent activity from goals and notifications
      generateRecentActivity(goals, notifications);

      // Load leaderboard preview with friends data
      await loadLeaderboardPreview(friends);

    } catch (error) {
      console.error('Failed to load dashboard ', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivity = (goals: Goal[], notifications: Notification[]) => {
    const activities: ActivityItem[] = [];

    // Add recent goal completions
    goals.forEach(goal => {
      const userAssignment = goal.assignments.find(a => a.userId === user!.id);
      if (userAssignment?.status === 'COMPLETED' && userAssignment.completedAt) {
        activities.push({
          id: goal.id,
          type: 'goal_completed',
          message: `You completed "${goal.title}"${goal.type === 'SHARED' ? ' (shared goal)' : ''}`,
          timestamp: userAssignment.completedAt,
          points: getPointsForDifficulty(goal.difficulty),
        });
      }
    });

    // Add recent notifications
    notifications.slice(0, 3).forEach(notification => {
      activities.push({
        id: notification.id,
        type: notification.type as any,
        message: notification.message,
        timestamp: notification.createdAt,
      });
    });

    // Sort by timestamp and take recent 5
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivity(activities.slice(0, 5));
  };

  const getPointsForDifficulty = (difficulty: string): number => {
    // Normalize difficulty to uppercase to handle any case variations
    const normalizedDifficulty = difficulty?.toUpperCase();
    switch (normalizedDifficulty) {
      case 'EASY': return 10;
      case 'MEDIUM': return 20;
      case 'HARD': return 30;
      default:
        console.warn(`Unknown difficulty level: ${difficulty}`);
        return 0;
    }
  };

  const loadLeaderboardPreview = async (friendsData: User[]) => {
    try {
      // Get real leaderboard data from API
      const leaderboardResponse = await leaderboardService.getGlobalLeaderboard(5, 'allTime');
      
      if (leaderboardResponse.users && leaderboardResponse.users.length > 0) {
        const leaderboardData: LeaderboardUser[] = leaderboardResponse.users.map((userData) => ({
          ...userData,
          email: userData.email || '',
          createdAt: userData.createdAt || new Date().toISOString()
        }));
        
        setLeaderboard(leaderboardData);
      } else {
        // Fallback to friends + current user if no global data
        const allUsers = [user!, ...friendsData];
        const sortedUsers = allUsers.sort((a, b) => (b.points || 0) - (a.points || 0));
        
        const leaderboardData: LeaderboardUser[] = sortedUsers.slice(0, 5).map((userData, index) => ({
          ...userData,
          rank: index + 1
        }));
        
        setLeaderboard(leaderboardData);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      // Fallback to friends + current user on error
      const allUsers = [user!, ...friendsData];
      const sortedUsers = allUsers.sort((a, b) => (b.points || 0) - (a.points || 0));
      
      const leaderboardData: LeaderboardUser[] = sortedUsers.slice(0, 5).map((userData, index) => ({
        ...userData,
        rank: index + 1
      }));
      
      setLeaderboard(leaderboardData);
    }
  };

  const handleCompleteGoal = async (goalId: number) => {
  try {
    setRefreshing(true);

    const goalToComplete = goals.find(g => g.id === goalId);
    const pointsToAdd = goalToComplete ? getPointsForDifficulty(goalToComplete.difficulty) : 0;
    
    // Debug logging
    console.log('Dashboard - Completing goal:', {
      goalId,
      goalTitle: goalToComplete?.title,
      difficulty: goalToComplete?.difficulty,
      pointsToAdd,
      currentUserPoints: user?.points
    });

    // Backend: Complete goal first
    const response = await goalService.completeGoal(goalId, user!.id);
    console.log('Goal completion response:', response);

    // Wait a bit for backend to process
    await new Promise(resolve => setTimeout(resolve, 500));

    // Refresh user data from backend to get updated points
    const updatedUser = await userService.getUserById(user!.id);
    console.log('Updated user after goal completion:', {
      oldPoints: user?.points,
      newPoints: updatedUser?.points,
      pointsDifference: (updatedUser?.points || 0) - (user?.points || 0)
    });

    if (updatedUser) {
      dispatch(updateUser(updatedUser));
    }

    // Refresh goals and recalculate stats
    const updatedGoals = await goalService.getGoals(user!.id);
    setGoals(updatedGoals);

    // Update local stats immediately
    const completedGoals = updatedGoals.filter(goal =>
      goal.assignments.some(a => a.userId === user!.id && a.status === 'COMPLETED')
    ).length;

    const pendingGoals = updatedGoals.filter(goal =>
      goal.assignments.some(a => a.userId === user!.id && a.status === 'PENDING')
    ).length;

    const personalGoals = updatedGoals.filter(goal => goal.type === 'PERSONAL');
    const sharedGoals = updatedGoals.filter(goal => goal.type === 'SHARED');

    setStats(prevStats => ({
      ...prevStats,
      totalGoals: updatedGoals.length,
      completedGoals,
      pendingGoals,
      personalGoals: personalGoals.length,
      sharedGoals: sharedGoals.length,
      totalPoints: updatedUser?.points || prevStats.totalPoints
    }));

    // 👉 Dispatch a custom event to tell other components to refresh
    window.dispatchEvent(new CustomEvent('refreshStats'));

    // Toast with actual points gained
    const actualPointsGained = (updatedUser?.points || 0) - (user?.points || 0);
    const goalType = goalToComplete?.type === 'SHARED' ? ' (shared goal)' : '';
    toast.success(`Goal completed! 🎉 +${actualPointsGained} points!${goalType}`);
  } catch (error) {
    if (user) {
      dispatch(refreshUser(user.id)); // fallback
    }
    toast.error('Failed to complete goal');
    console.error('Goal completion error:', error);
  } finally {
    setRefreshing(false);
  }
};


  const handleCreateNewGoal = () => {
    navigate('/goals');
  };

  const handleInviteFriends = () => {
    navigate('/friends');
  };

  const handleChallengeFriend = () => {
    navigate('/friends?tab=friends');
  };

  const handleViewAllActivity = () => {
    navigate('/profile');
  };

  const getUserGoalStatus = (goal: Goal) => {
    const userAssignment = goal.assignments.find(a => a.userId === user!.id);
    return userAssignment?.status === 'COMPLETED';
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

  const filteredGoals = getFilteredGoals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-400 to-red-500 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Enhanced Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
                >
                  Welcome back, {user?.username}!
                  <motion.span
                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                    transition={{ delay: 1, duration: 2.5, ease: "easeInOut" }}
                    className="inline-block ml-2"
                  >
                    👋
                  </motion.span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 text-xl mb-4"
                >
                  Ready to achieve your goals today?
                </motion.p>
                
                {/* Enhanced streak display */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap items-center gap-4"
                >
                  {stats.currentStreak > 0 && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                    >
                      🔥 {stats.currentStreak} day streak!
                    </motion.div>
                  )}
                  {stats.sharedGoals > 0 && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                    >
                      🎯 {stats.sharedGoals} challenge goals active
                    </motion.div>
                  )}
                  {stats.pendingChallenges > 0 && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                    >
                      ⏳ {stats.pendingChallenges} pending challenges
                    </motion.div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                  >
                    💎 {stats.totalPoints} total points
                  </motion.div>
                </motion.div>
              </div>
                     
              {/* Enhanced Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadDashboardData}
                disabled={refreshing}
                className="bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 shadow-lg backdrop-blur-sm border border-white/20"
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : {}}
                  transition={refreshing ? { duration: 1, repeat: Infinity } : {}}
                  className="text-xl"
                >
                  🔄
                </motion.div>
                <span className="font-medium">Refresh</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <DashboardStats stats={stats} />

        {/* Prominent Leaderboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <MotionCard className="relative overflow-hidden bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-200">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 transform rotate-45 translate-x-32 -translate-y-32">
                <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
              </div>
              <div className="absolute bottom-0 left-0 w-48 h-48 transform -rotate-45 -translate-x-24 translate-y-24">
                <div className="w-full h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full" />
              </div>
            </div>

            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="text-4xl"
                    >
                      🏆
                    </motion.div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-1">
                        Leaderboard Challenge
                      </h2>
                      <p className="text-gray-600 text-lg">
                        See how you rank against other goal achievers!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 mb-6">
                    {userRank && (
                      <div className="flex items-center space-x-2">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          #{userRank.rank}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Your Rank</p>
                          <p className="font-bold text-gray-900">#{userRank.rank} of {userRank.totalUsers}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {stats.totalPoints}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Your Points</p>
                        <p className="font-bold text-gray-900">{stats.totalPoints} points</p>
                      </div>
                    </div>

                    {leaderboard.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          {leaderboard.slice(0, 3).map((user, index) => (
                            <div
                              key={user.id}
                              className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-sm ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                                'bg-gradient-to-r from-orange-400 to-red-500'
                              }`}
                            >
                              {user.username.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Top Players</p>
                          <p className="font-bold text-gray-900">Active Competition</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/leaderboard')}
                      className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
                    >
                      <Trophy size={24} />
                      <span>View Full Leaderboard</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                    </motion.button>

                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-200"
                    >
                      <div className="flex items-center space-x-2">
                        <Sparkles size={16} className="text-yellow-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Compete with {leaderboard.length} players
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Decorative Trophy */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="hidden lg:block"
                >
                  <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                    <Crown size={48} className="text-white" />
                  </div>
                </motion.div>
              </div>
            </div>
          </MotionCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-4">
            <AnimatedButton
              onClick={handleCreateNewGoal}
              variant="primary"
              className="flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Create New Goal
            </AnimatedButton>
            
            {/* ✅ Direct Challenge a Friend Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleChallengeFriend}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Swords size={20} />
              </motion.div>
              <span>Challenge a Friend</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-yellow-300"
              >
                ⚔️
              </motion.div>
            </motion.button>
            
            <AnimatedButton
              onClick={handleInviteFriends}
              variant="secondary"
              className="flex items-center"
            >
              <Users size={20} className="mr-2" />
              Invite Friends ({stats.friendsCount})
            </AnimatedButton>

            {/* ✅ Add challenge navigation button */}
            {stats.pendingChallenges > 0 && (
              <AnimatedButton
                onClick={() => navigate('/challenges')}
                variant="secondary"
                className="flex items-center bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Zap size={20} className="mr-2" />
                View Challenges ({stats.pendingChallenges})
              </AnimatedButton>
            )}

            {stats.overdueGoals > 0 && (
              <AnimatedButton
                onClick={() => navigate('/goals')}
                variant="danger"
                className="flex items-center"
              >
                ⚠️ {stats.overdueGoals} Overdue Goals
              </AnimatedButton>
            )}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Goals Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* ✅ Enhanced header with counts */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Target className="mr-3" />
                    Your Goals ({goals.length})
                  </h2>
                  <div className="flex items-center space-x-4 text-blue-200 text-sm mt-1">
                    <span>{stats.personalGoals} Personal</span>
                    <span>•</span>
                    <span>{stats.sharedGoals} Shared</span>
                  </div>
                </div>
              </div>

              {/* ✅ Goal Type Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <MotionCard className="p-1">
                  <div className="flex">
                    <button
                      onClick={() => setActiveGoalTab('all')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        activeGoalTab === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      All Goals ({goals.length})
                    </button>
                    <button
                      onClick={() => setActiveGoalTab('personal')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        activeGoalTab === 'personal'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <UserIcon size={16} className="inline mr-1" />
                      Personal ({stats.personalGoals})
                    </button>
                    <button
                      onClick={() => setActiveGoalTab('shared')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        activeGoalTab === 'shared'
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Users size={16} className="inline mr-1" />
                      Shared ({stats.sharedGoals})
                    </button>
                  </div>
                </MotionCard>
              </motion.div>
              
              {filteredGoals.length === 0 ? (
                <MotionCard>
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      {activeGoalTab === 'shared' ? '🎯' : '🎯'}
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {activeGoalTab === 'shared' 
                        ? 'No shared goals yet!' 
                        : activeGoalTab === 'personal'
                        ? 'No personal goals yet!'
                        : 'No goals yet!'
                      }
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {activeGoalTab === 'shared' 
                        ? 'Accept challenge invitations to create shared goals with friends.'
                        : 'Create your first goal and start your journey to success.'
                      }
                    </p>
                    <div className="flex justify-center space-x-3">
                      {activeGoalTab === 'shared' ? (
                        <AnimatedButton 
                          onClick={() => navigate('/challenges')}
                          variant="primary"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Zap size={20} className="mr-2" />
                          View Challenges
                        </AnimatedButton>
                      ) : (
                        <AnimatedButton 
                          onClick={handleCreateNewGoal}
                          variant="primary"
                        >
                          <Plus size={20} className="mr-2" />
                          Create Your First Goal
                        </AnimatedButton>
                      )}
                    </div>
                  </div>
                </MotionCard>
              ) : (
                <div className="space-y-6">
                  {filteredGoals.slice(0, 3).map((goal, index) => {
                    const typeInfo = getGoalTypeInfo(goal);
                    return (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        {/* ✅ Enhanced Goal Card with Type Info */}
                        <MotionCard className="p-6">
                          <div className="flex items-start space-x-4">
                            {/* Goal Type Icon */}
                            <div className={`p-2 rounded-lg ${
                              goal.type === 'SHARED' ? 'bg-purple-100' : 'bg-blue-100'
                            }`}>
                              {typeInfo.icon}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{goal.title}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.badgeColor}`}>
                                  {typeInfo.badge}
                                </span>
                              </div>

                              {goal.type === 'SHARED' && (
                                <p className="text-sm text-purple-600 mb-2 font-medium">
                                  🎯 Challenge goal • {typeInfo.description}
                                </p>
                              )}

                              {goal.description && (
                                <p className="text-gray-700 mb-3">{goal.description}</p>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                                  <span>Difficulty: {goal.difficulty}</span>
                                  {goal.type === 'SHARED' && (
                                    <span>{goal.assignments?.length || 0} participants</span>
                                  )}
                                </div>

                                {!getUserGoalStatus(goal) && (
                                  <AnimatedButton
                                    onClick={() => handleCompleteGoal(goal.id)}
                                    variant={goal.type === 'SHARED' ? 'primary' : 'primary'}
                                    size="sm"
                                    className={goal.type === 'SHARED' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                                  >
                                    Complete
                                  </AnimatedButton>
                                )}

                                {getUserGoalStatus(goal) && (
                                  <span className="text-green-600 font-medium text-sm">
                                    ✅ Completed
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </MotionCard>
                      </motion.div>
                    );
                  })}
                  
                  {filteredGoals.length > 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <AnimatedButton
                        onClick={() => navigate('/goals')}
                        variant="secondary"
                        className="w-full"
                      >
                        View All {activeGoalTab === 'all' ? 'Goals' : 
                                 activeGoalTab === 'shared' ? 'Shared Goals' : 'Personal Goals'} 
                        ({filteredGoals.length - 3} more)
                      </AnimatedButton>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <RecentActivity 
                activities={recentActivity}
              />
            </motion.div>

            {/* Enhanced Leaderboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <MotionCard className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="mr-2 text-2xl"
                      >
                        🏆
                      </motion.div>
                      Top Players
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/leaderboard')}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      View All →
                    </motion.button>
                  </div>
                  
                  <div className="space-y-4">
                    {leaderboard.slice(0, 3).map((leaderboardUser, index) => (
                      <motion.div
                        key={leaderboardUser.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-yellow-100 hover:border-yellow-200 transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                              'bg-gradient-to-r from-orange-400 to-red-500'
                            }`}>
                              {index + 1}
                            </div>
                            {index === 0 && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-1 -right-1"
                              >
                                <Crown size={12} className="text-yellow-500" />
                              </motion.div>
                            )}
                          </div>
                          
                          <div>
                            <p className="font-bold text-gray-900">
                              {leaderboardUser.id === user?.id ? 'You' : leaderboardUser.username}
                              {leaderboardUser.id === user?.id && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {leaderboardUser.completedGoals || 0} goals completed
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            index === 0 ? 'text-yellow-600' : 'text-gray-700'
                          }`}>
                            {leaderboardUser.points}
                          </p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {leaderboard.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🏆</div>
                      <p className="text-gray-600 text-sm">No leaderboard data yet</p>
                      <p className="text-gray-500 text-xs">Complete goals to see rankings</p>
                    </div>
                  )}
                </div>
              </MotionCard>
            </motion.div>

            {/* Quick Stats */}
            {notifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <MotionCard>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    📬 Notifications
                  </h3>
                  <p className="text-gray-600 mb-3">
                    You have {notifications.filter(n => !n.seen).length} unread notifications
                  </p>
                  <AnimatedButton
                    onClick={() => navigate('/notifications')}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    View All Notifications
                  </AnimatedButton>
                </MotionCard>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
