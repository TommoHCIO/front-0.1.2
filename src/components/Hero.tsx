import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { Button } from './Button';
import { Incubator } from './Incubator';

const rewards = [
  { amount: '1 $CTE', action: 'per view', id: 'view' },
  { amount: '2 $CTE', action: 'per like', id: 'like' },
  { amount: '5 $CTE', action: 'per comment', id: 'comment' },
  { amount: '10 $CTE', action: 'per repost', id: 'repost' },
];

export const Hero = () => {
  return (
    <div className="space-y-8">
      <div className="bg-[#1E2A37]/50 backdrop-blur-lg rounded-3xl p-8 md:p-12 text-white relative overflow-hidden border border-white/5">
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-[#7F56D9] w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold relative">
                CTE
                <div className="absolute -right-1 -top-1 w-3 h-3 bg-white rounded-full" />
                <div className="absolute -left-1 -bottom-1 w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#2D9CDB]">
              Chat to Earn
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              The Future of Social Engagement
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
              {rewards.map(({ amount, action, id }) => (
                <div
                  key={id}
                  className="bg-[#1E2A37] rounded-xl p-4 border border-white/5"
                >
                  <div className="text-lg font-bold text-[#2D9CDB]">{amount}</div>
                  <div className="text-sm text-gray-400">{action}</div>
                </div>
              ))}
            </div>

            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Join our revolutionary platform where social engagement meets blockchain rewards.
            </p>

            <div className="flex justify-center gap-4">
              <Button 
                variant="primary"
                icon={ArrowRight}
                className="bg-[#2D9CDB] hover:bg-[#2D9CDB]/90"
              >
                Get Started
              </Button>
              <Button variant="ghost" className="text-[#2D9CDB] hover:bg-[#2D9CDB]/10">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <Incubator />
    </div>
  );
};