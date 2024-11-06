import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

const USDT_MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
const INCUBATOR_WALLET = new PublicKey('H8oTGbCNLRXu844GBRXCAfWTxt6Sa9vB9gut9bLrPdWv');

const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana.api.chainstack.com/mainnet-beta',
  'https://mainnet.helius-rpc.com/?api-key=1d41e12c-c663-4f33-a820-87114a71b76d',
  'https://neat-hidden-sanctuary.solana-mainnet.discover.quiknode.pro/2af5315d336f9ae920028bbb90a73b724dc1bbed'
];

async function getWorkingConnection(): Promise<Connection> {
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const connection = new Connection(endpoint, 'confirmed');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      await connection.getSlot({ signal: controller.signal });
      clearTimeout(timeoutId);
      
      return connection;
    } catch {
      continue;
    }
  }
  throw new Error('No working RPC endpoint found');
}

export async function getUSDTBalance(): Promise<number> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const connection = await getWorkingConnection();
      
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        INCUBATOR_WALLET,
        { mint: USDT_MINT }
      );

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance || 0;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  console.error('Failed to fetch USDT balance:', lastError);
  return 0;
}

export async function getUserStakedAmount(walletAddress: string): Promise<number> {
  if (!walletAddress) return 0;

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const connection = await getWorkingConnection();
      
      // Get all token accounts for the incubator wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        INCUBATOR_WALLET,
        { mint: USDT_MINT }
      );

      if (!tokenAccounts.value.length) {
        return 0;
      }

      // Get recent transfers to the incubator wallet
      const signatures = await connection.getSignaturesForAddress(
        INCUBATOR_WALLET,
        { limit: 1000 }
      );

      let total = 0;
      const processedTxs = new Set();

      // Process in smaller batches
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

          const isFromUser = tx.transaction.message.accountKeys.some(
            key => key.pubkey.toString() === walletAddress
          );

          if (isFromUser) {
            const postBalances = tx.meta.postTokenBalances || [];
            const preBalances = tx.meta.preTokenBalances || [];

            for (const post of postBalances) {
              if (post.owner === INCUBATOR_WALLET.toString() &&
                  post.mint === USDT_MINT.toString()) {
                
                const pre = preBalances.find(b => b.accountIndex === post.accountIndex);
                const preAmount = pre?.uiTokenAmount.uiAmount || 0;
                const postAmount = post.uiTokenAmount.uiAmount || 0;
                
                if (postAmount > preAmount) {
                  total += (postAmount - preAmount);
                }
              }
            }
          }
        }
      }

      return total;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  console.error('Failed to fetch staked amount:', lastError);
  return 0;
}