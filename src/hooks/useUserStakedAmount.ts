import { useState, useEffect, useCallback, useRef } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { SolanaConnectionManager } from '../utils/solanaConnection';
import { SOLANA_CONSTANTS } from '../utils/constants';

export function useUserStakedAmount(walletAddress: string | null) {
  const [stakedAmount, setStakedAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchStakedAmount = useCallback(async () => {
    if (!walletAddress) {
      setStakedAmount(0);
      setIsLoading(false);
      return;
    }

    const connectionManager = SolanaConnectionManager.getInstance();

    try {
      await connectionManager.executeWithRetry(async (connection: Connection) => {
        const walletPubkey = new PublicKey(walletAddress);
        const userTokenAccount = await getAssociatedTokenAddress(
          SOLANA_CONSTANTS.USDT_MINT,
          walletPubkey
        );

        // Get recent signatures first
        const signatures = await connection.getSignaturesForAddress(
          SOLANA_CONSTANTS.INCUBATOR_WALLET,
          { limit: 100 },
          'confirmed'
        );

        let total = 0;

        // Process transactions in parallel with a limit
        const batchSize = 10;
        for (let i = 0; i < signatures.length; i += batchSize) {
          const batch = signatures.slice(i, i + batchSize);
          const transactions = await Promise.all(
            batch.map(({ signature }) =>
              connection.getParsedTransaction(signature, {
                maxSupportedTransactionVersion: 0,
                commitment: 'confirmed'
              })
            )
          );

          for (const tx of transactions) {
            if (!tx?.meta || !tx.meta.postTokenBalances || !tx.meta.preTokenBalances) continue;

            // Look for transfers from this user to the incubator wallet
            const transfer = tx.meta.postTokenBalances.find(balance => 
              balance.owner === SOLANA_CONSTANTS.INCUBATOR_WALLET.toString() &&
              balance.mint === SOLANA_CONSTANTS.USDT_MINT.toString()
            );

            const fromAccount = tx.transaction.message.accountKeys.find(
              key => key.pubkey.toString() === userTokenAccount.toString()
            );

            if (transfer && fromAccount) {
              const preBalance = tx.meta.preTokenBalances.find(
                b => b.accountIndex === transfer.accountIndex
              )?.uiTokenAmount.uiAmount || 0;
              
              const postBalance = transfer.uiTokenAmount.uiAmount || 0;
              const difference = postBalance - preBalance;
              
              if (difference > 0) {
                total += difference;
              }
            }
          }
        }

        if (mountedRef.current) {
          setStakedAmount(total);
          setError(null);
        }
      });
    } catch (err: any) {
      if (mountedRef.current) {
        console.error('Staked amount fetch error:', err);
        setError('Failed to fetch staked amount');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [walletAddress]);

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    fetchStakedAmount();

    intervalRef.current = setInterval(fetchStakedAmount, SOLANA_CONSTANTS.BALANCE_REFRESH_INTERVAL);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStakedAmount]);

  return { stakedAmount, isLoading, error, refetch: fetchStakedAmount };
}