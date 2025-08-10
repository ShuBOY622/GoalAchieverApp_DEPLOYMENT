import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { challengeService } from '../../services/challengeService';
import { useAppSelector } from '../../hooks/reduxHooks';

interface ChallengeBellProps {
  userId?: number;
}

export const ChallengeBell: React.FC<ChallengeBellProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNewChallenges, setHasNewChallenges] = useState(false);
  
  // Use refs to avoid dependency issues
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const eventTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  // Stable function that doesn't change on re-renders
  const loadPendingChallenges = async () => {
    if (!user?.id || isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      console.log('🎯 Loading pending challenges for user:', user.id);
      
      const challenges = await challengeService.getPendingChallenges(user.id);
      const pendingChallenges = challenges.filter(c => c.status === 'PENDING');
      
      console.log('📊 Found pending challenges:', pendingChallenges.length);
      
      // Use functional state update to avoid dependency issues
      setPendingCount(prevCount => {
        // Check if count increased (new challenges)
        if (pendingChallenges.length > prevCount && prevCount > 0) {
          setHasNewChallenges(true);
          // Reset the "new" indicator after 3 seconds
          setTimeout(() => setHasNewChallenges(false), 3000);
        }
        return pendingChallenges.length;
      });
    } catch (error) {
      console.error('Failed to load pending challenges:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    
    // Initial load
    loadPendingChallenges();
    
    // Set up aggressive polling for real-time updates
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      loadPendingChallenges();
    }, 5000); // 5 seconds for real-time polling
    
    // Event handlers with minimal throttling for responsiveness
    const handleChallengeEvents = () => {
      console.log('🔄 Challenge event detected, refreshing count...');
      if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
      eventTimeoutRef.current = setTimeout(() => {
        loadPendingChallenges();
      }, 200); // Reduced to 200ms for instant updates
    };

    // Add event listeners
    window.addEventListener('challengeAccepted', handleChallengeEvents);
    window.addEventListener('challengeRejected', handleChallengeEvents);
    window.addEventListener('refreshChallenges', handleChallengeEvents);
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (eventTimeoutRef.current) {
        clearTimeout(eventTimeoutRef.current);
        eventTimeoutRef.current = null;
      }
      window.removeEventListener('challengeAccepted', handleChallengeEvents);
      window.removeEventListener('challengeRejected', handleChallengeEvents);
      window.removeEventListener('refreshChallenges', handleChallengeEvents);
    };
  }, [user?.id]); // Only depend on user.id, nothing else

  const handleClick = () => {
    navigate('/challenges');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-all group"
      title={`Challenges ${pendingCount > 0 ? `(${pendingCount} pending)` : ''}`}
    >
      {/* Enhanced Challenge Icon with Gradient Background */}
      <div className="relative">
        <motion.div
          animate={hasNewChallenges ? {
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          } : {}}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Glowing Background Effect */}
          <motion.div
            animate={pendingCount > 0 ? {
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-0 group-hover:opacity-30"
          />
          
          {/* Main Icon Container */}
          <div className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            pendingCount > 0 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 group-hover:from-purple-500 group-hover:to-pink-500'
          }`}>
            {/* Animated Sparkles for New Challenges */}
            {hasNewChallenges && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles size={12} className="text-yellow-300" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute -bottom-1 -left-1"
                >
                  <Sparkles size={8} className="text-yellow-300" />
                </motion.div>
              </>
            )}
            
            {/* Main Challenge Icon */}
            <motion.div
              animate={loading ? { rotate: 360 } : {}}
              transition={loading ? { duration: 1, repeat: Infinity } : {}}
            >
              {pendingCount > 0 ? (
                <Target size={16} className="text-white" />
              ) : (
                <Zap size={16} className="text-white" />
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Count Badge */}
        {pendingCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -right-2"
          >
            <motion.div
              animate={hasNewChallenges ? {
                scale: [1, 1.3, 1],
                rotate: [0, 15, -15, 0]
              } : {}}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Pulsing Ring Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.8, 0, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 rounded-full"
              />
              
              {/* Main Badge */}
              <div className="relative w-6 h-6 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full text-xs flex items-center justify-center font-bold shadow-lg border-2 border-white">
                {pendingCount > 9 ? '9+' : pendingCount}
              </div>
              
              {/* Shine Effect */}
              <motion.div
                animate={{
                  x: [-10, 10],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 rounded-full transform rotate-45"
              />
            </motion.div>
          </motion.div>
        )}

        {/* Pulse Effect for New Challenges */}
        {hasNewChallenges && (
          <motion.div
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1, repeat: 2 }}
            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          />
        )}
      </div>

      {/* Tooltip-like Indicator */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        >
          {pendingCount} pending challenge{pendingCount !== 1 ? 's' : ''}
        </motion.div>
      )}
    </motion.button>
  );
};