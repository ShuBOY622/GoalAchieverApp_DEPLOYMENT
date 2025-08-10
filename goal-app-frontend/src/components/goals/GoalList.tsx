import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SortAsc, Grid, List } from 'lucide-react';
import { Goal } from '../../types/goal';
import { GoalCard } from './GoalCard';
import { MotionCard } from '../common/MotionCard';

interface GoalListProps {
  goals: Goal[];
  onComplete: (goalId: number) => void;
  currentUserId: number;
  loading?: boolean;
}

type SortOption = 'newest' | 'oldest' | 'deadline' | 'difficulty' | 'progress';
type FilterOption = 'all' | 'pending' | 'completed' | 'overdue' | 'personal' | 'shared';
type ViewMode = 'grid' | 'list';

export const GoalList: React.FC<GoalListProps> = ({
  goals,
  onComplete,
  currentUserId,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filter goals based on search and filters
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const userAssignment = goal.assignments.find(a => a.userId === currentUserId);
    const isCompleted = userAssignment?.status === 'COMPLETED';
    const isOverdue = new Date(goal.deadline) < new Date() && !isCompleted;

    switch (filterBy) {
      case 'pending':
        return !isCompleted && !isOverdue;
      case 'completed':
        return isCompleted;
      case 'overdue':
        return isOverdue;
      case 'personal':
        return goal.type === 'PERSONAL';
      case 'shared':
        return goal.type === 'SHARED';
      default:
        return true;
    }
  });

  // Sort goals
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'difficulty':
        const difficultyOrder = { EASY: 1, MEDIUM: 2, HARD: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      case 'progress':
        const aProgress = a.assignments.filter(assignment => assignment.status === 'COMPLETED').length / a.assignments.length;
        const bProgress = b.assignments.filter(assignment => assignment.status === 'COMPLETED').length / b.assignments.length;
        return bProgress - aProgress;
      default:
        return 0;
    }
  });

  const getUserGoalStatus = (goal: Goal) => {
    const userAssignment = goal.assignments.find(a => a.userId === currentUserId);
    return userAssignment?.status === 'COMPLETED';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <MotionCard key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </MotionCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <MotionCard className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters and Controls */}
          <div className="flex items-center space-x-4">
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Goals</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="personal">Personal</option>
                <option value="shared">Shared</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <SortAsc size={16} className="text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="deadline">By Deadline</option>
                <option value="difficulty">By Difficulty</option>
                <option value="progress">By Progress</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid size={16} className={viewMode === 'grid' ? 'text-blue-600' : 'text-gray-500'} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List size={16} className={viewMode === 'list' ? 'text-blue-600' : 'text-gray-500'} />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            Showing {sortedGoals.length} of {goals.length} goals
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear search
            </button>
          )}
        </div>
      </MotionCard>

      {/* Goals Grid/List */}
      <AnimatePresence>
        {sortedGoals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MotionCard className="p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm || filterBy !== 'all' ? 'No goals found' : 'No goals yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterBy !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first goal to get started on your journey'
                }
              </p>
            </MotionCard>
          </motion.div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {sortedGoals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={viewMode === 'list' ? 'w-full' : ''}
              >
                <GoalCard
                  goal={goal}
                  onComplete={onComplete}
                  isCompleted={getUserGoalStatus(goal)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
