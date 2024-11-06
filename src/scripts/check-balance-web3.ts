import { Connection, PublicKey } from '@solana/web3.js';
import { SOLANA_CONSTANTS } from '../utils/constants';
import { SolanaConnectionManager } from '../utils/solanaConnection';

async function checkUSDTBalance(walletAddress: string) {
  const connectionManager = SolanaConnectionManager.getInstance();

  try {
    await connectionManager.executeWithRetry(async (connection: Connection) => {
      const walletPubkey = new PublicKey(walletAddress);
      
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletPubkey,
        { mint: SOLANA_CONSTANTS.USDT_MINT }
      );

      if (tokenAccounts.value.length === 0) {
        console.log('No USDT balance found');
        return;
      }

      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      console.log(`USDT Balance: ${balance.toLocaleString()} USDT`);
      
      // Additional account details
      const accountInfo = tokenAccounts.value[0].account.data.parsed.info;
      console.log('\nAccount Details:');
      console.log(`Token Account: ${tokenAccounts.value[0].pubkey.toString()}`);
      console.log(`Owner: ${accountInfo.owner}`);
      console.log(`State: ${accountInfo.state}`);
      console.log(`Close Authority: ${accountInfo.closeAuthority || 'None'}`);
    });
  } catch (error) {
    console.error('Error checking balance:', error);
  }
}

// Check balance for the example wallet
checkUSDTBalance('H8oTGbCNLRXu844GBRXCAfWTxt6Sa9vB9gut9bLrPdWv');