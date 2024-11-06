import React, { createContext, useContext, useState, useCallback } from 'react';

interface WalletContextType {
  wallet: any | null;
  publicKey: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: (type: 'Solflare' | 'Phantom') => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<any | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async (type: 'Solflare' | 'Phantom') => {
    try {
      setIsConnecting(true);

      if (type === 'Solflare') {
        // @ts-ignore
        const { solflare } = window;
        if (!solflare) {
          window.open('https://solflare.com/download', '_blank');
          throw new Error('Solflare extension not installed');
        }

        await solflare.connect();
        setWallet(solflare);
        setPublicKey(solflare.publicKey?.toString() || null);
        setIsConnected(true);
      } else if (type === 'Phantom') {
        // @ts-ignore
        const { phantom } = window;
        if (!phantom?.solana) {
          window.open('https://phantom.app/', '_blank');
          throw new Error('Phantom extension not installed');
        }

        const connection = await phantom.solana.connect();
        setWallet(phantom.solana);
        setPublicKey(connection.publicKey.toString());
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (wallet) {
        await wallet.disconnect();
        setWallet(null);
        setPublicKey(null);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Wallet disconnection error:', error);
    }
  }, [wallet]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        publicKey,
        isConnecting,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}