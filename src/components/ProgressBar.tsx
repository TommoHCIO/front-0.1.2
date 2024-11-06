import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  goal: number;
  className?: string;
}

export const ProgressBar = ({ current, goal, className = '' }: ProgressBarProps) => {
  const percentage = Math.min((current / goal) * 100, 100);
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="h-3 bg-[#141F2A] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#2D9CDB] to-[#7F56D9] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Progress</span>
        <span className="text-[#2D9CDB]">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};