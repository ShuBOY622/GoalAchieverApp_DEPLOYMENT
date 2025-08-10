import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Target, Users, Calendar, Zap } from 'lucide-react';
import { AnimatedButton } from '../common/AnimatedButton';
import { MotionCard } from '../common/MotionCard';

interface GoalFormProps {
  onSubmit: (goalData: any) => void;
  onCancel: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'PERSONAL',
    difficulty: 'MEDIUM',
    deadline: '',
    assignedUserIds: [] as number[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <MotionCard className="max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-gray-900 flex items-center"
        >
          <Target className="mr-3 text-blue-600" />
          Create New Goal
        </motion.h2>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onCancel}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={24} />
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Goal Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter your goal title"
            required
          />
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Describe your goal in detail"
          />
        </motion.div>

        {/* Type and Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Goal Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="PERSONAL"
                  checked={formData.type === 'PERSONAL'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <Target size={16} className="mr-2 text-blue-600" />
                Personal Goal
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="SHARED"
                  checked={formData.type === 'SHARED'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <Users size={16} className="mr-2 text-green-600" />
                Shared Goal
              </label>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Difficulty Level
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="EASY">🟢 Easy (10 points)</option>
              <option value="MEDIUM">🟡 Medium (20 points)</option>
              <option value="HARD">🔴 Hard (30 points)</option>
            </select>
          </motion.div>
        </div>

        {/* Deadline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
            <Calendar size={16} className="mr-2" />
            Deadline
          </label>
          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            min={new Date().toISOString().slice(0, 16)}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex space-x-4 pt-6 border-t border-gray-200"
        >
          <AnimatedButton
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </AnimatedButton>
          
          <AnimatedButton
            variant="primary"
            className="flex-1 flex items-center justify-center"
          >
            <Zap size={16} className="mr-2" />
            Create Goal
          </AnimatedButton>
        </motion.div>
      </form>
    </MotionCard>
  );
};
