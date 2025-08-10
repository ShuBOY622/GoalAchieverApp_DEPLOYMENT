import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Users, User, Clock, CheckCircle } from 'lucide-react';
import { MotionCard } from '../common/MotionCard';
import { AnimatedButton } from '../common/AnimatedButton';
import { useAppSelector } from '../../hooks/reduxHooks';
import { goalService } from '../../services/goalService';
import { format } from 'date-fns';

interface Goal {
  id: number;
  title: string;
  description: string;
  type: 'PERSONAL' | 'SHARED';
  difficulty: string;
  deadline: string;
  createdAt: string;
  assignments: Array<{
    userId: number;
    status: 'PENDING' | 'COMPLETED' | 'MISSED';
    completedAt?: string;
  }>;
}

export const GoalsSection: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'shared'>('all');

  useEffect(() => {
    if (user) {
      loadUserGoals();
    }
  }, [user]);

  const loadUserGoals = async () => {
    try {
      setLoading(true);
      // This should return both personal and shared goals
      const userGoals = await goalService.getGoals(user!.id);
      setGoals(userGoals);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredGoals = () => {
    switch (activeTab) {
      case 'personal':
        return goals.filter(goal => goal.type === 'PERSONAL');
      case 'shared':
        return goals.filter(goal => goal.type === 'SHARED');
      default:
        return goals;
    }
  };

  const getGoalStatusForUser = (goal: Goal) => {
    const userAssignment = goal.assignments.find(a => a.userId === user!.id);
    return userAssignment?.status || 'PENDING';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-600';
      case 'MISSED': return 'bg-red-100 text-red-600';
      default: return 'bg-yellow-100 text-yellow-600';
    }
  };

  const filteredGoals = getFilteredGoals();
  const sharedGoals = goals.filter(goal => goal.type === 'SHARED');
  const personalGoals = goals.filter(goal => goal.type === 'PERSONAL');

  if (loading) {
    return (
      <MotionCard className="p-6">
        <div className="flex items-center justify-center h-32">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </MotionCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Counts */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Goals</h2>
          <div className="flex items-center space-x-4 text-blue-200">
            <span>{personalGoals.length} Personal</span>
            <span>•</span>
            <span>{sharedGoals.length} Shared</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <MotionCard className="p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Goals ({goals.length})
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'personal'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User size={16} className="inline mr-1" />
            Personal ({personalGoals.length})
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'shared'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users size={16} className="inline mr-1" />
            Shared ({sharedGoals.length})
          </button>
        </div>
      </MotionCard>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <MotionCard className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'shared' 
                ? 'No shared goals yet' 
                : activeTab === 'personal' 
                ? 'No personal goals yet'
                : 'No goals yet'
              }
            </h3>
            <p className="text-gray-600">
              {activeTab === 'shared' 
                ? 'Accepted challenges will appear here as shared goals.'
                : 'Start by creating your first goal or accepting a challenge!'
              }
            </p>
          </MotionCard>
        ) : (
          filteredGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MotionCard className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {/* Goal Type Icon */}
                      {goal.type === 'SHARED' ? (
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Users size={18} className="text-purple-600" />
                        </div>
                      ) : (
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User size={18} className="text-blue-600" />
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{goal.title}</h3>
                        {goal.type === 'SHARED' && (
                          <span className="text-sm text-purple-600 font-medium">
                            🎯 Challenge Goal - Shared with friend
                          </span>
                        )}
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-gray-700 mb-3">{goal.description}</p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        Due: {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                      </div>
                      <div>
                        Difficulty: {goal.difficulty}
                      </div>
                      {goal.type === 'SHARED' && (
                        <div>
                          {goal.assignments.length} participants
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getStatusColor(getGoalStatusForUser(goal))
                    }`}>
                      {getGoalStatusForUser(goal)}
                    </span>

                    {getGoalStatusForUser(goal) === 'PENDING' && (
                      <AnimatedButton
                        variant="primary"
                        size="sm"
                        onClick={() => {/* Handle complete goal */}}
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Complete
                      </AnimatedButton>
                    )}
                  </div>
                </div>
              </MotionCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
