import { Transaction, PublicKey, Connection } from '@solana/web3.js';
import { 
  createTransferInstruction, 
  getAssociatedTokenAddress, 
  TOKEN_PROGRAM_ID, 
  getAccount,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import { SolanaConnectionManager } from '../utils/solanaConnection';
import { SOLANA_CONSTANTS } from '../utils/constants';

async function getOrCreateAssociatedTokenAccount(
  connection: Connection,
  wallet: any,
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const associatedToken = await getAssociatedTokenAddress(mint, owner);
  
  try {
    await getAccount(connection, associatedToken);
    return associatedToken;
  } catch (error: any) {
    if (error.name === 'TokenAccountNotFoundError') {
      const instruction = createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedToken,
        owner,
        mint
      );
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      const transaction = new Transaction({
        feePayer: wallet.publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(instruction);

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction({
        signature,
        blockhash: transaction.blockhash,
        lastValidBlockHeight: transaction.lastValidBlockHeight,
      });

      return associatedToken;
    }
    throw error;
  }
}

export async function createUSDTTransferTransaction(wallet: any, amount: number): Promise<Transaction> {
  const connectionManager = SolanaConnectionManager.getInstance();

  return connectionManager.executeWithRetry(async (connection: Connection) => {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (amount <= 0 || amount > 100000) {
      throw new Error('Invalid transfer amount');
    }

    // Get or create user's token account
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      SOLANA_CONSTANTS.USDT_MINT,
      wallet.publicKey
    );

    // Get or create incubator's token account
    const incubatorTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      SOLANA_CONSTANTS.USDT_MINT,
      SOLANA_CONSTANTS.INCUBATOR_WALLET
    );

    // Check user's USDT balance
    try {
      const userAccount = await getAccount(connection, userTokenAccount);
      const userBalance = Number(userAccount.amount) / Math.pow(10, SOLANA_CONSTANTS.USDT_DECIMALS);
      if (userBalance < amount) {
        throw new Error(`Insufficient USDT balance. You have ${userBalance.toFixed(2)} USDT`);
      }
    } catch (error: any) {
      if (error.name === 'TokenAccountNotFoundError') {
        throw new Error('No USDT account found. Please fund your wallet first.');
      }
      throw new Error('Failed to check USDT balance');
    }

    // Create transfer instruction with proper decimal conversion
    const transferAmount = BigInt(Math.floor(amount * Math.pow(10, SOLANA_CONSTANTS.USDT_DECIMALS)));
    const transferInstruction = createTransferInstruction(
      userTokenAccount,
      incubatorTokenAccount,
      wallet.publicKey,
      transferAmount,
      [],
      TOKEN_PROGRAM_ID
    );

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

    return new Transaction({
      feePayer: wallet.publicKey,
      blockhash,
      lastValidBlockHeight,
    }).add(transferInstruction);
  });
}

export async function sendAndConfirmTransaction(wallet: any, transaction: Transaction): Promise<string> {
  const connectionManager = SolanaConnectionManager.getInstance();

  return connectionManager.executeWithRetry(async (connection: Connection) => {
    try {
      // Request signature from wallet
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      // Wait for confirmation with a longer timeout
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: transaction.blockhash,
        lastValidBlockHeight: transaction.lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      return signature;
    } catch (error: any) {
      if (error.message.includes('User rejected')) {
        throw new Error('Transaction cancelled by user');
      }
      throw new Error(`Transaction failed: ${error.message}`);
    }
  });
}