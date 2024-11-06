import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SOLANA_CONSTANTS } from '../utils/constants';

interface CacheEntry {
  balance: number;
  timestamp: number;
}

const balanceCache = new Map<string, CacheEntry>();

export async function getUSDTBalance(connection: Connection, walletAddress: string): Promise<number> {
  if (!walletAddress) {
    throw new Error('Wallet address is required');
  }

  try {
    const now = Date.now();
    const cached = balanceCache.get(walletAddress);
    
    if (cached && (now - cached.timestamp) < SOLANA_CONSTANTS.CACHE_DURATION) {
      return cached.balance;
    }

    // Clean up old cache entries
    for (const [key, entry] of balanceCache.entries()) {
      if (now - entry.timestamp > SOLANA_CONSTANTS.CACHE_DURATION) {
        balanceCache.delete(key);
      }
    }

    const walletPubkey = new PublicKey(walletAddress);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { mint: SOLANA_CONSTANTS.USDT_MINT },
      { commitment: 'confirmed' }
    );

    let balance = 0;
    if (tokenAccounts.value.length > 0) {
      balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
    }

    // Cache the result
    balanceCache.set(walletAddress, {
      balance,
      timestamp: now
    });

    return balance;
  } catch (error) {
    console.error('Balance fetch error:', error);
    
    // Return cached value if available, even if expired
    const cached = balanceCache.get(walletAddress);
    if (cached) {
      return cached.balance;
    }
    
    throw error;
  }
}