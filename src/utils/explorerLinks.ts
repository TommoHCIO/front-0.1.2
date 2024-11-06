import { SOLANA_CONSTANTS } from './constants';

export type ExplorerType = 'transaction' | 'address' | 'token';

interface Explorer {
  name: string;
  baseUrl: string;
  getUrl: (type: ExplorerType, value: string) => string;
}

export const EXPLORERS: Explorer[] = [
  {
    name: 'Solana Explorer',
    baseUrl: 'https://explorer.solana.com',
    getUrl: (type, value) => {
      switch (type) {
        case 'transaction':
          return `https://explorer.solana.com/tx/${value}`;
        case 'address':
          return `https://explorer.solana.com/address/${value}`;
        case 'token':
          return `https://explorer.solana.com/address/${value}/tokens`;
      }
    },
  },
  {
    name: 'Solana FM',
    baseUrl: 'https://solana.fm',
    getUrl: (type, value) => {
      switch (type) {
        case 'transaction':
          return `https://solana.fm/tx/${value}`;
        case 'address':
          return `https://solana.fm/address/${value}`;
        case 'token':
          return `https://solana.fm/address/${value}/tokens`;
      }
    },
  },
  {
    name: 'Solscan',
    baseUrl: 'https://solscan.io',
    getUrl: (type, value) => {
      switch (type) {
        case 'transaction':
          return `https://solscan.io/tx/${value}`;
        case 'address':
          return `https://solscan.io/account/${value}`;
        case 'token':
          return `https://solscan.io/token/${value}`;
      }
    },
  },
  {
    name: 'Solana Beach',
    baseUrl: 'https://solanabeach.io',
    getUrl: (type, value) => {
      switch (type) {
        case 'transaction':
          return `https://solanabeach.io/transaction/${value}`;
        case 'address':
          return `https://solanabeach.io/address/${value}`;
        case 'token':
          return `https://solanabeach.io/token/${value}`;
      }
    },
  },
  {
    name: 'Validators App',
    baseUrl: 'https://www.validators.app',
    getUrl: (type, value) => {
      switch (type) {
        case 'transaction':
          return `https://www.validators.app/transactions/${value}`;
        case 'address':
          return `https://www.validators.app/accounts/${value}`;
        case 'token':
          return `https://www.validators.app/tokens/${value}`;
      }
    },
  },
];

export function getExplorerUrls(type: ExplorerType, value: string): { name: string; url: string }[] {
  return EXPLORERS.map(explorer => ({
    name: explorer.name,
    url: explorer.getUrl(type, value),
  }));
}