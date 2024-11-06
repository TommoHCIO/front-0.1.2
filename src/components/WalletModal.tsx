import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../context/WalletContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const wallets = [
  {
    name: 'Solflare',
    icon: '/solflare.png',
    description: 'Connect to your Solflare Wallet',
    type: 'Solflare' as const,
  },
  {
    name: 'Phantom',
    icon: '/phantom.png',
    description: 'Connect to your Phantom Wallet',
    type: 'Phantom' as const,
  }
];

export const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const { connect, isConnecting } = useWallet();

  const handleWalletConnect = async (wallet: typeof wallets[0]) => {
    try {
      await connect(wallet.type);
      onClose();
    } catch (error: any) {
      if (error.message.includes('not installed')) {
        // Extension not installed error is already handled in connect()
        return;
      }
      console.error(`Failed to connect to ${wallet.name}:`, error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md mx-4 bg-[#1a2634] border border-white/10 rounded-2xl shadow-xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              {wallets.map((wallet) => (
                <motion.button
                  key={wallet.name}
                  onClick={() => handleWalletConnect(wallet)}
                  disabled={isConnecting}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className="w-6 h-6"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.textContent = wallet.name[0];
                      }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white group-hover:text-accent transition-colors">
                      {wallet.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {wallet.description}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              By connecting a wallet, you agree to Chat to Earn's Terms of Service
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};