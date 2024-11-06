import { useState, useEffect, useCallback, useRef } from 'react';
import { getUSDTBalance } from '../utils/solana';
import { SOLANA_CONSTANTS } from '../utils/constants';

export function useIncubatorBalance() {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout>();
  const fetchingRef = useRef<boolean>(false);

  const fetchBalance = useCallback(async () => {
    if (!mountedRef.current || fetchingRef.current) return;

    fetchingRef.current = true;
    try {
      const newBalance = await getUSDTBalance();
      
      if (mountedRef.current) {
        setBalance(newBalance);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        console.error('Failed to fetch incubator balance:', err);
        setError('Failed to fetch balance');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchBalance();

    // Set up polling interval
    intervalRef.current = setInterval(fetchBalance, SOLANA_CONSTANTS.BALANCE_REFRESH_INTERVAL);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchBalance]);

  const refetch = useCallback(() => {
    return fetchBalance();
  }, [fetchBalance]);

  return { balance, isLoading, error, refetch };
}