import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ExplorerLinks } from './ExplorerLinks';

interface Transaction {
  amount: number;
  timestamp: number;
  signature: string;
  type: 'deposit' | 'withdrawal';
}

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx, index) => (
        <motion.div
          key={tx.signature}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                tx.type === 'deposit' 
                  ? 'bg-green-500/10 text-green-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {tx.type === 'deposit' ? <ArrowDownRight /> : <ArrowUpRight />}
              </div>
              <div>
                <div className="font-medium">
                  {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(tx.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-medium ${
                tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'
              }`}>
                {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} USDT
              </div>
              <ExplorerLinks
                type="transaction"
                value={tx.signature}
                className="mt-1"
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};