import React from 'react';
import { useUSDTBalance } from '../hooks/useUSDTBalance';
import { useWallet } from '../context/WalletContext';
import { RefreshCw } from 'lucide-react';

export const USDTBalance = () => {
  const { publicKey } = useWallet();
  const { balance, isLoading, error, refetch, lastUpdated } = useUSDTBalance(publicKey);

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault();
    refetch();
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (!publicKey) return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">USDT Balance:</span>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#2D9CDB] border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-400">Loading...</span>
              </div>
            ) : (
              <span className="font-medium">{balance.toLocaleString()} USDT</span>
            )}
          </div>
          {lastUpdated && !error && (
            <div className="text-xs text-gray-500">
              Updated {formatLastUpdated()}
            </div>
          )}
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`p-1.5 hover:bg-white/10 rounded-full transition-colors ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Refresh balance"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div className="text-sm text-red-400">
          Unable to fetch balance
        </div>
      ) : (
        <div className="text-xs text-gray-400">
          {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
        </div>
      )}
    </div>
  );
};