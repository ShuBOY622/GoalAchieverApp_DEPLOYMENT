import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calendar, Clock, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AnimatedButton } from '../common/AnimatedButton';
import { MotionCard } from '../common/MotionCard';
import { toast } from 'react-toastify';
import { challengeService } from '../../services/challengeService';
import { useAppSelector } from '../../hooks/reduxHooks';

interface ChallengeModalProps {
  isOpen: boolean;
  friendId: number;
  friendName: string;
  onClose: () => void;
  onChallengeSent: () => void;
}

interface ChallengeFormData {
  title: string;
  description?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  deadline: string;
}

const challengeSchema = yup.object({
  title: yup.string().required('Title is required').max(255, 'Title too long'),
  description: yup.string().max(1000, 'Description too long').optional(),
  difficulty: yup.mixed<'EASY' | 'MEDIUM' | 'HARD'>().oneOf(['EASY', 'MEDIUM', 'HARD']).required('Difficulty is required'),
  deadline: yup.string().required('Deadline is required'),
});

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  friendId,
  friendName,
  onClose,
  onChallengeSent,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ChallengeFormData>({
    resolver: yupResolver(challengeSchema),
    defaultValues: {
      difficulty: 'MEDIUM',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
    }
  });

  const selectedDifficulty = watch('difficulty');

  const difficultyOptions = [
    { 
      value: 'EASY', 
      label: 'Easy', 
      description: '10 points', 
      color: 'text-green-600 bg-green-100',
      icon: '🟢'
    },
    { 
      value: 'MEDIUM', 
      label: 'Medium', 
      description: '20 points', 
      color: 'text-yellow-600 bg-yellow-100',
      icon: '🟡'
    },
    { 
      value: 'HARD', 
      label: 'Hard', 
      description: '30 points', 
      color: 'text-red-600 bg-red-100',
      icon: '🔴'
    },
  ];

  const onSubmit = async (data: ChallengeFormData) => {
    try {
      setIsSubmitting(true);
      
      // Get user ID from localStorage first, then from Redux store
      const userIdString = localStorage.getItem('userId');
      let userId = userIdString ? parseInt(userIdString) : null;
      
      // If not in localStorage, try to get from Redux store
      if (!userId && user?.id) {
        userId = user.id;
      }
      
      if (!userId) {
        toast.error('User not authenticated. Please log in.');
        return;
      }
      
      const challengeData = {
        challengerId: userId,
        challengedUserId: friendId,
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        deadline: new Date(data.deadline + 'T23:59:59').toISOString(),
      };

      await challengeService.sendChallenge(challengeData);
      
      toast.success(`Challenge sent to ${friendName}! 🎯`);
      reset();
      onChallengeSent();
      onClose();
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-lg"
          >
            <MotionCard className="relative">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Target className="mr-3 text-blue-600" />
                    Challenge {friendName}
                  </h2>
                  <p className="text-gray-600 mt-1">Create a goal challenge for your friend</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit as (data: any) => void)} className="p-6 space-y-6">
                {/* Challenge Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Challenge Title *
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    placeholder="e.g., Run 5km every day"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder="Add details about the challenge..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Difficulty Level *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {difficultyOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedDifficulty === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          {...register('difficulty')}
                          type="radio"
                          value={option.value}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.difficulty && (
                    <p className="text-red-600 text-sm mt-2">{errors.difficulty.message}</p>
                  )}
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Challenge Deadline *
                  </label>
                  <div className="relative">
                    <input
                      {...register('deadline')}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Calendar className="absolute right-3 top-3 text-gray-400" size={20} />
                  </div>
                  {errors.deadline && (
                    <p className="text-red-600 text-sm mt-1">{errors.deadline.message}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <AnimatedButton
                    variant="secondary"
                    onClick={handleClose}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </AnimatedButton>
                  <AnimatedButton
                    variant="primary"
                    className="flex-1 flex items-center justify-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <Zap size={18} className="mr-2" />
                    )}
                    {isSubmitting ? 'Sending...' : 'Send Challenge'}
                  </AnimatedButton>
                </div>
              </form>
            </MotionCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
