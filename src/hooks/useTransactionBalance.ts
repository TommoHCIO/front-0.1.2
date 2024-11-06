import { useState, useEffect, useCallback, useRef } from 'react';
import { Connection } from '@solana/web3.js';
import { SolanaConnectionManager } from '../utils/solanaConnection';
import { calculateBalanceFromTransactions, getTransactionHistory } from '../services/transactionService';

export interface UseTransactionBalanceResult {
  balance: number;
  isLoading: boolean;
  error: string | null;
  transactions: Array<{
    amount: number;
    timestamp: number;
    signature: string;
    type: 'deposit' | 'withdrawal';
  }>;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useTransactionBalance(walletAddress: string | null): UseTransactionBalanceResult {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Array<{
    amount: number;
    timestamp: number;
    signature: string;
    type: 'deposit' | 'withdrawal';
  }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mountedRef = useRef<boolean>(true);
  const fetchingRef = useRef<boolean>(false);
  const lastFetchRef = useRef<number>(0);
  const pollingTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchBalance = useCallback(async (force = false) => {
    if (!walletAddress || !mountedRef.current || fetchingRef.current) return;
    
    // Prevent fetching more often than every 30 seconds unless forced
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 30000) return;
    
    fetchingRef.current = true;
    lastFetchRef.current = now;
    
    const connectionManager = SolanaConnectionManager.getInstance();

    try {
      await connectionManager.executeWithRetry(async (connection: Connection) => {
        const [newBalance, txHistory] = await Promise.all([
          calculateBalanceFromTransactions(connection, walletAddress),
          getTransactionHistory(connection, walletAddress)
        ]);
        
        if (mountedRef.current) {
          setBalance(newBalance);
          setTransactions(txHistory);
          setLastUpdated(new Date());
          setError(null);
        }
      });
    } catch (err: any) {
      if (mountedRef.current) {
        console.error('Transaction balance fetch error:', err);
        setError('Failed to fetch balance from transactions');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      fetchingRef.current = false;

      // Schedule next fetch
      if (mountedRef.current) {
        pollingTimeoutRef.current = setTimeout(() => {
          fetchBalance();
        }, 30000);
      }
    }
  }, [walletAddress]);

  useEffect(() => {
    mountedRef.current = true;
    fetchBalance(true); // Initial fetch

    return () => {
      mountedRef.current = false;
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [fetchBalance]);

  const refetch = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }
    return fetchBalance(true);
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    transactions,
    refetch,
    lastUpdated
  };
}