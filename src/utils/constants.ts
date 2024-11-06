import { PublicKey } from '@solana/web3.js';

export const SOLANA_CONSTANTS = {
  USDT_MINT: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
  INCUBATOR_WALLET: new PublicKey('H8oTGbCNLRXu844GBRXCAfWTxt6Sa9vB9gut9bLrPdWv'),
  RPC_ENDPOINTS: [
    'https://bitter-necessary-fire.solana-mainnet.quiknode.pro/9f2b94fd2a64eca4308bfe2c78043465443a1c54/',
    'https://api.mainnet-beta.solana.com'
  ],
  WSS_ENDPOINT: 'wss://bitter-necessary-fire.solana-mainnet.quiknode.pro/9f2b94fd2a64eca4308bfe2c78043465443a1c54/',
  CONNECTION_CONFIG: {
    commitment: 'confirmed',
    wsEndpoint: 'wss://bitter-necessary-fire.solana-mainnet.quiknode.pro/9f2b94fd2a64eca4308bfe2c78043465443a1c54/',
    useWs: true,
    disableRetryOnRateLimit: true,
    httpHeaders: {
      'Content-Type': 'application/json',
    }
  },
  CACHE_DURATION: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second between retries
  REQUEST_TIMEOUT: 5000, // 5 seconds
  USDT_DECIMALS: 6,
  MAX_REQUESTS_PER_SECOND: 10,
  REQUEST_RESET_INTERVAL: 1000, // 1 second
  MIN_ENDPOINT_SWITCH_INTERVAL: 5000 // 5 seconds minimum between endpoint switches
};