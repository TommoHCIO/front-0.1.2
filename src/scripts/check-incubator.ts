import { getUSDTBalance } from '../utils/solana.js';

async function checkIncubatorBalance() {
  try {
    console.log('Fetching incubator USDT balance...');
    const balance = await getUSDTBalance();
    console.log(`Current USDT Balance: ${balance.toLocaleString()} USDT`);
    return balance;
  } catch (error) {
    console.error('Error fetching incubator balance:', error);
    process.exit(1);
  }
}

// Execute the check
checkIncubatorBalance();