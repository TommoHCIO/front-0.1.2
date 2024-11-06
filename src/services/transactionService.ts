import { Connection, PublicKey } from '@solana/web3.js';
import { SOLANA_CONSTANTS } from '../utils/constants';

interface TokenTransfer {
  amount: number;
  timestamp: number;
  signature: string;
  type: 'deposit' | 'withdrawal';
}

export async function getTransactionHistory(
  connection: Connection,
  walletAddress: string,
  limit = 100
): Promise<TokenTransfer[]> {
  try {
    const walletPubkey = new PublicKey(walletAddress);
    const signatures = await connection.getSignaturesForAddress(
      walletPubkey,
      { limit },
      'confirmed'
    );

    const transfers: TokenTransfer[] = [];
    const processedTxs = new Set<string>();

    // Process transactions in smaller batches
    const batchSize = 25;
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
        if (!tx?.meta || processedTxs.has(tx.signature)) continue;
        processedTxs.add(tx.signature);

        const postBalances = tx.meta.postTokenBalances || [];
        const preBalances = tx.meta.preTokenBalances || [];

        for (let i = 0; i < postBalances.length; i++) {
          const post = postBalances[i];
          const pre = preBalances.find(b => b.accountIndex === post.accountIndex);

          if (post.mint === SOLANA_CONSTANTS.USDT_MINT.toString()) {
            const preAmount = pre?.uiTokenAmount.uiAmount || 0;
            const postAmount = post.uiTokenAmount.uiAmount || 0;
            const difference = postAmount - preAmount;

            if (difference !== 0) {
              transfers.push({
                amount: Math.abs(difference),
                timestamp: tx.blockTime ? tx.blockTime * 1000 : Date.now(),
                signature: tx.signature,
                type: difference > 0 ? 'deposit' : 'withdrawal'
              });
            }
          }
        }
      }
    }

    return transfers.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
}

export async function calculateBalanceFromTransactions(
  connection: Connection,
  walletAddress: string
): Promise<number> {
  try {
    const transfers = await getTransactionHistory(connection, walletAddress);
    
    return transfers.reduce((balance, transfer) => {
      return balance + (transfer.type === 'deposit' ? transfer.amount : -transfer.amount);
    }, 0);
  } catch (error) {
    console.error('Error calculating balance from transactions:', error);
    throw error;
  }
}