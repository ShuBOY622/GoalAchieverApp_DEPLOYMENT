import React from 'react';
import { motion } from 'framer-motion';
import { RegisterForm } from '../components/auth/RegisterForm';

export const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl flex items-center justify-center">
        {/* Left side - Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-1 flex-col justify-center items-center text-white p-12"
        >
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="text-8xl mb-8"
          >
            🚀
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold mb-6 text-center"
          >
            Join the Journey
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-center max-w-md opacity-90 mb-8"
          >
            Start your goal-achieving adventure today. Connect with friends, track progress, and celebrate every victory!
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 gap-4 text-center"
          >
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-bounce"></div>
              <span>Set and track personal goals</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <span>Challenge friends with shared goals</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <span>Earn points and climb leaderboards</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
              <span>Get real-time notifications</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Register Form */}
        <div className="flex-1 flex items-center justify-center p-4">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};
