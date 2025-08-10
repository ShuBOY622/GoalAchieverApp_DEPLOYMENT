import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Trophy, Target, Calendar, TrendingUp, Settings, Edit3, ArrowLeft } from 'lucide-react';
import { Header } from '../components/common/Header';
import { MotionCard } from '../components/common/MotionCard';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { useAppSelector } from '../hooks/reduxHooks';
import { RootState } from '../store';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import { goalService } from '../services/goalService';
import { userService } from '../services/userService';
import { friendService } from '../services/friendService';

interface UserStats {
  totalGoals: number;
  completedGoals: number;
  streakDays: number;
  averageCompletionTime: number;
  successRate: number;
  totalFriends: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
  points?: number;
}

interface ActivityItem {
  id: number;
  title: string;
  date: Date;
  points: number;
  type: 'goal_completed' | 'achievement' | 'friend_added';
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAppSelector((state: RootState) => state.auth);
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [stats, setStats] = useState<UserStats>({
    totalGoals: 0,
    completedGoals: 0,
    streakDays: 0,
    averageCompletionTime: 0,
    successRate: 0,
    totalFriends: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 1, title: 'Goal Getter', description: 'Complete your first goal', icon: '🎯', earned: false },
    { id: 2, title: 'Streak Master', description: 'Maintain a 7-day streak', icon: '🔥', earned: false },
    { id: 3, title: 'Team Player', description: 'Complete 5 shared goals', icon: '🤝', earned: false },
    { id: 4, title: 'Overachiever', description: 'Complete 50 goals', icon: '⭐', earned: false },
    { id: 5, title: 'Point Master', description: 'Earn 1000 points', icon: '💎', earned: false },
    { id: 6, title: 'Social Butterfly', description: 'Add 10 friends', icon: '🦋', earned: false },
  ]);

  // ✅ ONLY ONE useEffect - this handles both own and friend profiles
  useEffect(() => {
    if (currentUser) {
      console.log('Loading profile for userId:', userId, 'currentUser:', currentUser.id);
      determineProfileToShow();
    }
  }, [currentUser, userId]);

  const determineProfileToShow = async () => {
    try {
      setLoading(true);
      
      console.log('determineProfileToShow - userId:', userId, 'currentUser.id:', currentUser?.id);
      
      if (!userId || userId === currentUser?.id.toString()) {
        // Show current user's profile
        console.log('Showing own profile');
        setIsOwnProfile(true);
        setProfileUser(currentUser);
        await loadProfileData(currentUser!.id);
      } else {
        // Show friend's profile
        console.log('Showing friend profile for ID:', userId);
        setIsOwnProfile(false);
        
        try {
          // Fetch friend's user data
          const friendData = await userService.getUserById(parseInt(userId));
          console.log('Friend data loaded:', friendData);
          setProfileUser(friendData);
          await loadProfileData(parseInt(userId));
        } catch (error) {
          console.error('Failed to load friend ', error);
          toast.error('Friend profile not found');
          navigate('/profile');
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };
const loadProfileData = async (targetUserId: number) => {
  try {
    console.log('loadProfileData for user ID:', targetUserId);
    
    const [
      userStatsData,
      goalsData,
      friendsData,
    ] = await Promise.allSettled([
      userService.getUserStats(targetUserId),
      goalService.getGoals(targetUserId),
      friendService.getFriends(targetUserId),
    ]);

    // ✅ Initialize with default values
    let statsResult: UserStats = {
      totalGoals: 0,
      completedGoals: 0,
      streakDays: 0,
      averageCompletionTime: 0,
      successRate: 0,
      totalFriends: 0,
    };

    // ✅ Merge API response with defaults instead of direct assignment
    if (userStatsData.status === 'fulfilled') {
      statsResult = {
        ...statsResult,  // Keep default values
        ...userStatsData.value,  // Override with API values where available
      };
    }

    // Process goals data
    if (goalsData.status === 'fulfilled') {
      const goals = goalsData.value;
      const completedGoals = goals.filter((goal: any) => 
        goal.assignments.some((a: any) => a.userId === targetUserId && a.status === 'COMPLETED')
      ).length;

      // ✅ Update calculated values
      statsResult = {
        ...statsResult,
        totalGoals: goals.length,
        completedGoals,
        successRate: goals.length > 0 ? (completedGoals / goals.length) * 100 : 0,
      };

      generateRecentActivity(goals, targetUserId);
    }

    // Process friends data
    if (friendsData.status === 'fulfilled') {
      statsResult = {
        ...statsResult,
        totalFriends: friendsData.value.length,
      };
    }

    setStats(statsResult);
    calculateAchievements(statsResult, targetUserId);
    
  } catch (error) {
    console.error('Failed to load profile ', error);
    toast.error('Failed to load profile data');
  }
};


  const generateRecentActivity = (goals: any[], targetUserId: number) => {
    const activities: ActivityItem[] = [];

    goals.forEach(goal => {
      const userAssignment = goal.assignments.find((a: any) => a.userId === targetUserId);
      if (userAssignment?.status === 'COMPLETED' && userAssignment.completedAt) {
        activities.push({
          id: goal.id,
          title: `Completed "${goal.title}"`,
          date: new Date(userAssignment.completedAt),
          points: getPointsForDifficulty(goal.difficulty),
          type: 'goal_completed',
        });
      }
    });

    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    setRecentActivity(activities.slice(0, 5));
  };

  const calculateAchievements = (userStats: UserStats, targetUserId: number) => {
    const updatedAchievements = achievements.map(achievement => {
      let earned = false;
      
      // Get the target user's points
      const userPoints = isOwnProfile ? currentUser?.points : profileUser?.points;

      switch (achievement.id) {
        case 1:
          earned = userStats.completedGoals >= 1;
          break;
        case 2:
          earned = userStats.streakDays >= 7;
          break;
        case 3:
          earned = userStats.completedGoals >= 5;
          break;
        case 4:
          earned = userStats.completedGoals >= 50;
          break;
        case 5:
          earned = (userPoints || 0) >= 1000;
          break;
        case 6:
          earned = userStats.totalFriends >= 10;
          break;
      }

      return { ...achievement, earned };
    });

    setAchievements(updatedAchievements);
  };

  const getPointsForDifficulty = (difficulty: string): number => {
    switch (difficulty) {
      case 'EASY': return 10;
      case 'MEDIUM': return 20;
      case 'HARD': return 30;
      default: return 0;
    }
  };

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    const targetUserId = profileUser?.id || currentUser?.id;
    if (targetUserId) {
      await loadProfileData(targetUserId);
    }
    setRefreshing(false);
    toast.success('Profile refreshed! 🔄');
  };

  const handleEditProfile = () => {
    if (isOwnProfile) {
      toast.info('Edit profile feature coming soon! ⚙️');
    } else {
      toast.info('You can only edit your own profile');
    }
  };

  const handleShareProfile = () => {
    const shareUserId = profileUser?.id || currentUser?.id;
    navigator.clipboard.writeText(`${window.location.origin}/profile/${shareUserId}`);
    toast.success('Profile link copied to clipboard! 📋');
  };

  const handleCreateNewGoal = () => {
    navigate('/goals');
  };

  const handleInviteFriends = () => {
    navigate('/friends');
  };

  const handleViewLeaderboard = () => {
    navigate('/leaderboard');
  };

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

  // ✅ Add safety check
  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <MotionCard className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">The profile you're looking for doesn't exist.</p>
            <AnimatedButton onClick={() => navigate('/friends')} variant="primary">
              Back to Friends
            </AnimatedButton>
          </MotionCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* ✅ Back button for friend profiles */}
        {!isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <AnimatedButton
              variant="secondary"
              onClick={() => navigate('/friends')}
              className="flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Friends
            </AnimatedButton>
          </motion.div>
        )}

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <MotionCard className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Image */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {profileUser?.username.charAt(0).toUpperCase()} {/* ✅ Use profileUser */}
                </div>
                {/* ✅ Only show edit button on own profile */}
                {isOwnProfile && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEditProfile}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit3 size={16} className="text-gray-600" />
                  </motion.button>
                )}
              </motion.div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <motion.h1
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-bold text-gray-900 mb-2"
                    >
                      {profileUser?.username} {/* ✅ Use profileUser */}
                      {!isOwnProfile && (
                        <span className="ml-3 text-lg bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                          Friend
                        </span>
                      )}
                    </motion.h1>
                    
                    {/* ✅ Only show email on own profile */}
                    {isOwnProfile && (
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-600 mb-4"
                      >
                        {profileUser?.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Refresh Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefreshProfile}
                    disabled={refreshing}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <motion.div
                      animate={refreshing ? { rotate: 360 } : {}}
                      transition={refreshing ? { duration: 1, repeat: Infinity } : {}}
                    >
                      🔄
                    </motion.div>
                    <span className="text-sm">Refresh</span>
                  </motion.button>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap justify-center md:justify-start gap-4 mb-6"
                >
                  <div className="flex items-center bg-blue-100 px-4 py-2 rounded-full">
                    <Trophy className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-600">{profileUser?.points} Points</span> {/* ✅ Use profileUser */}
                  </div>
                  
                  <div className="flex items-center bg-green-100 px-4 py-2 rounded-full">
                    <Calendar className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-600">
                      Joined {format(new Date(profileUser?.createdAt || new Date()), 'MMM yyyy')} {/* ✅ Use profileUser */}
                    </span>
                  </div>

                  {stats.streakDays > 0 && (
                    <div className="flex items-center bg-orange-100 px-4 py-2 rounded-full">
                      <span className="text-orange-600 mr-2">🔥</span>
                      <span className="font-semibold text-orange-600">{stats.streakDays} Day Streak</span>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {/* ✅ Different buttons for own vs friend profile */}
                  {isOwnProfile ? (
                    <>
                      <AnimatedButton 
                        variant="primary" 
                        className="mr-4"
                        onClick={handleEditProfile}
                      >
                        <Settings size={16} className="mr-2" />
                        Edit Profile
                      </AnimatedButton>
                      <AnimatedButton 
                        variant="secondary"
                        onClick={handleShareProfile}
                      >
                        Share Profile
                      </AnimatedButton>
                    </>
                  ) : (
                    <>
                      <AnimatedButton 
                        variant="primary" 
                        className="mr-4"
                        onClick={() => {
                          toast.info(`Challenge ${profileUser?.username} to a goal! 🎯`);
                          navigate('/goals');
                        }}
                      >
                        <Target size={16} className="mr-2" />
                        Challenge
                      </AnimatedButton>
                      <AnimatedButton 
                        variant="secondary"
                        onClick={handleShareProfile}
                      >
                        Share Profile
                      </AnimatedButton>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </MotionCard>
        </motion.div>

        {/* Rest of your profile content remains the same... */}
        {/* Just make sure to use profileUser where appropriate */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Performance Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MotionCard>
                  <div className="text-center">
                    <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalGoals}</div>
                    <div className="text-gray-600">Total Goals</div>
                  </div>
                </MotionCard>
                
                <MotionCard>
                  <div className="text-center">
                    <Trophy className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stats.completedGoals}</div>
                    <div className="text-gray-600">Completed Goals</div>
                  </div>
                </MotionCard>
                
                <MotionCard>
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stats.streakDays}</div>
                    <div className="text-gray-600">Day Streak</div>
                  </div>
                </MotionCard>
                
                <MotionCard>
                  <div className="text-center">
                    <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {Math.round(stats.successRate)}%
                    </div>
                    <div className="text-gray-600">Success Rate</div>
                  </div>
                </MotionCard>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Achievements ({achievements.filter(a => a.earned).length}/{achievements.length})
              </h2>
              <MotionCard>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        achievement.earned
                          ? 'border-yellow-300 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50 opacity-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                        {achievement.earned && (
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="text-yellow-500 text-xl"
                          >
                            ✓
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </MotionCard>
            </motion.div>
          </div>

          {/* Sidebar with Recent Activity and Quick Actions */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
              <MotionCard>
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-gray-600">No recent activity</p>
                      <p className="text-sm text-gray-500">
                        {isOwnProfile ? 'Complete goals to see your activity here!' : 'No recent activity from this user'}
                      </p>
                    </div>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-600">
                              {format(activity.date, 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-green-600">+{activity.points}</span>
                          <Trophy size={16} className="text-green-600" />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </MotionCard>
            </motion.div>

            {/* Quick Actions - only show for own profile */}
            {isOwnProfile && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                <MotionCard>
                  <div className="space-y-3">
                    <AnimatedButton 
                      variant="primary" 
                      className="w-full"
                      onClick={handleCreateNewGoal}
                    >
                      <Target size={16} className="mr-2" />
                      Create New Goal
                    </AnimatedButton>
                    
                    <AnimatedButton 
                      variant="secondary" 
                      className="w-full"
                      onClick={handleInviteFriends}
                    >
                      <User size={16} className="mr-2" />
                      Invite Friends ({stats.totalFriends})
                    </AnimatedButton>
                    
                    <AnimatedButton 
                      variant="secondary" 
                      className="w-full"
                      onClick={handleViewLeaderboard}
                    >
                      <TrendingUp size={16} className="mr-2" />
                      View Leaderboard
                    </AnimatedButton>
                  </div>
                </MotionCard>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
