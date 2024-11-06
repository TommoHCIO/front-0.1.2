import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export const Tokenomics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#15202B] to-[#192734] p-8">
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 text-center max-w-2xl mx-auto"
        >
          <AlertCircle className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4 gradient-text">Tokenomics Coming Soon</h2>
          <p className="text-gray-400 leading-relaxed">
            Currently, $CTE remains in the incubation phase and has not yet been deployed. 
            Comprehensive tokenomics details will be made available upon completion of this phase.
          </p>
        </motion.div>
      </div>
    </div>
  );
};