import React from 'react';
import { motion, MotionProps } from 'framer-motion';

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  whileHover?: MotionProps['whileHover'];
  whileTap?: MotionProps['whileTap'];
  initial?: MotionProps['initial'];
  animate?: MotionProps['animate'];
  delay?: number;
}

export const MotionCard: React.FC<MotionCardProps> = ({
  children,
  className = '',
  whileHover = { y: -5, scale: 1.02 },
  whileTap = { scale: 0.98 },
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  delay = 0,
}) => {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-lg p-6 card-hover ${className}`}
      whileHover={whileHover}
      whileTap={whileTap}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
};
