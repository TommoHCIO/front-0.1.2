import { exec } from 'child_process';
import { promisify } from 'util';
import { SOLANA_CONSTANTS } from '../utils/constants';

const execAsync = promisify(exec);

async function checkUSDTBalance(walletAddress: string) {
  try {
    // Get all token accounts for the wallet
    const { stdout } = await execAsync(`solana spl-token accounts --owner ${walletAddress} --url mainnet-beta`);
    
    // Parse the output to find USDT balance
    const lines = stdout.split('\n');
    const usdtLine = lines.find(line => 
      line.includes(SOLANA_CONSTANTS.USDT_MINT.toString())
    );

    if (!usdtLine) {
      console.log('No USDT balance found');
      return;
    }

    // Extract and format the balance
    const [, balance] = usdtLine.split(/\s+/);
    console.log(`USDT Balance: ${parseFloat(balance).toLocaleString()} USDT`);

  } catch (error) {
    console.error('Error checking balance:', error);
  }
}

// Example usage
checkUSDTBalance('H8oTGbCNLRXu844GBRXCAfWTxt6Sa9vB9gut9bLrPdWv');