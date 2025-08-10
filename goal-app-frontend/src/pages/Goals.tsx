import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Plus, Filter, Search, Calendar, Target } from 'lucide-react';
import { Header } from '../components/common/Header';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalForm } from '../components/goals/GoalForm';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { MotionCard } from '../components/common/MotionCard';
import { RootState } from '../store';
import { goalService } from '../services/goalService';
import { userService } from '../services/userService';
import { Goal } from '../types/goal';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../hooks/reduxHooks';
import { updateUser, updateUserPoints } from '../store/authSlice';

export const Goals: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  useEffect(() => {
    filterGoals();
  }, [goals, searchTerm, filterStatus, filterDifficulty]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const goalsData = await goalService.getGoals(user!.id);
      setGoals(goalsData);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const filterGoals = () => {
    let filtered = [...goals];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(goal =>
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(goal => {
        const userAssignment = goal.assignments.find(a => a.userId === user!.id);
        const status = userAssignment?.status || 'PENDING';
        return status.toLowerCase() === filterStatus.toLowerCase();
      });
    }

    // Difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(goal =>
        goal.difficulty.toLowerCase() === filterDifficulty.toLowerCase()
      );
    }

    setFilteredGoals(filtered);
  };

  const handleCompleteGoal = async (goalId: number) => {
    try {
      const goalToComplete = goals.find(g => g.id === goalId);
      const pointsToAdd = goalToComplete ? getPointsForDifficulty(goalToComplete.difficulty) : 0;
      
      // Debug logging
      console.log('Goals - Completing goal:', {
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

      // Refresh goals
      loadGoals();

      // Dispatch custom event to notify other components (like Dashboard stats)
      window.dispatchEvent(new CustomEvent('refreshStats'));

      // ✅ Trigger notification refresh for shared goals
      if (goalToComplete?.type === 'SHARED') {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refreshNotifications'));
        }, 2000); // Allow backend to process notifications
      }

      // Toast notification with actual points gained
      const actualPointsGained = (updatedUser?.points || 0) - (user?.points || 0);
      const goalType = goalToComplete?.type === 'SHARED' ? ' (shared goal)' : '';
      toast.success(`Goal completed! 🎉 +${actualPointsGained} points!${goalType}`);
    } catch (error) {
      // Fallback to refresh user data on error
      if (user) {
        try {
          const updatedUser = await userService.getUserById(user.id);
          if (updatedUser) {
            dispatch(updateUser(updatedUser));
          }
        } catch (refreshError) {
          console.error('Failed to refresh user data:', refreshError);
        }
      }
      toast.error('Failed to complete goal');
      console.error('Goal completion error:', error);
    }
  };

  // Helper function to get points based on difficulty
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

  const handleCreateGoal = async (goalData: any) => {
    try {
      await goalService.createGoal({
        ...goalData,
        createdBy: user!.id,
      });
      toast.success('Goal created successfully! 🎯');
      setShowCreateForm(false);
      loadGoals();
    } catch (error) {
      toast.error('Failed to create goal');
    }
  };

  const getUserGoalStatus = (goal: Goal) => {
    const userAssignment = goal.assignments.find(a => a.userId === user!.id);
    return userAssignment?.status === 'COMPLETED';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Target className="mr-3" />
              My Goals
            </h1>
            <p className="text-white/70 text-lg">
              Manage and track your personal and shared goals
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatedButton
              onClick={() => setShowCreateForm(true)}
              variant="primary"
              className="flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Create New Goal
            </AnimatedButton>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <MotionCard className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search goals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </MotionCard>

        {/* Goals Grid */}
        <AnimatePresence>
          {filteredGoals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MotionCard>
                <div className="text-center py-12">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    🎯
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {searchTerm || filterStatus !== 'all' || filterDifficulty !== 'all'
                      ? 'No goals match your filters'
                      : 'No goals yet!'
                    }
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterStatus !== 'all' || filterDifficulty !== 'all'
                      ? 'Try adjusting your search criteria'
                      : 'Create your first goal and start your journey to success.'
                    }
                  </p>
                  {!(searchTerm || filterStatus !== 'all' || filterDifficulty !== 'all') && (
                    <AnimatedButton
                      onClick={() => setShowCreateForm(true)}
                      variant="primary"
                    >
                      <Plus size={20} className="mr-2" />
                      Create Your First Goal
                    </AnimatedButton>
                  )}
                </div>
              </MotionCard>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GoalCard
                    goal={goal}
                    onComplete={handleCompleteGoal}
                    isCompleted={getUserGoalStatus(goal)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MotionCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {goals.length}
                </div>
                <div className="text-gray-600">Total Goals</div>
              </div>
            </MotionCard>
            
            <MotionCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {goals.filter(goal => getUserGoalStatus(goal)).length}
                </div>
                <div className="text-gray-600">Completed</div>
              </div>
            </MotionCard>
            
            <MotionCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {goals.length > 0 
                    ? Math.round((goals.filter(goal => getUserGoalStatus(goal)).length / goals.length) * 100)
                    : 0
                  }%
                </div>
                <div className="text-gray-600">Success Rate</div>
              </div>
            </MotionCard>
          </div>
        </motion.div>
      </div>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <GoalForm
                onSubmit={handleCreateGoal}
                onCancel={() => setShowCreateForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
