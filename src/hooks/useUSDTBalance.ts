import { useState, useEffect, useCallback, useRef } from 'react';
import { Connection } from '@solana/web3.js';
import { SolanaConnectionManager } from '../utils/solanaConnection';
import { getUSDTBalance } from '../services/balanceService';

export function useUSDTBalance(walletAddress: string | null) {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mountedRef = useRef<boolean>(true);
  const lastFetchRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const fetchBalance = useCallback(async (force = false) => {
    if (!walletAddress || !mountedRef.current) return;

    const now = Date.now();
    if (!force && now - lastFetchRef.current < 1000) {
      return;
    }

    try {
      lastFetchRef.current = now;
      const connectionManager = SolanaConnectionManager.getInstance();
      
      const balance = await connectionManager.executeWithRetry(async (connection: Connection) => {
        return getUSDTBalance(connection, walletAddress);
      });
      
      if (mountedRef.current) {
        setBalance(balance);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        console.error('Balance fetch error:', err);
        setError('Failed to fetch balance');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        
        // Schedule next update
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          fetchBalance(true);
        }, 1000);
      }
    }
  }, [walletAddress]);

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    fetchBalance(true);

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchBalance]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return fetchBalance(true);
  }, [fetchBalance]);

  return { balance, isLoading, error, refetch, lastUpdated };
}