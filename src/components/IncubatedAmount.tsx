import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { useUserStakedAmount } from '../hooks/useUserStakedAmount';
import { Coins } from 'lucide-react';

export const IncubatedAmount = () => {
  const { publicKey } = useWallet();
  const { stakedAmount, isLoading } = useUserStakedAmount(publicKey);

  if (!publicKey) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1E2A37] rounded-xl p-6 border border-white/5 flex items-center gap-4"
    >
      <div className="bg-[#2D9CDB]/10 rounded-xl p-3">
        <Coins className="w-6 h-6 text-[#2D9CDB]" />
      </div>
      <div>
        <div className="text-sm text-gray-400 mb-1">My Incubated USDT</div>
        <div className="text-xl font-bold text-[#2D9CDB]">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#2D9CDB] border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : (
            `${stakedAmount.toLocaleString()} USDT`
          )}
        </div>
      </div>
    </motion.div>
  );
};