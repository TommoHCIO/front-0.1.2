import React from 'react';
import { Sidebar } from './Sidebar';
import { ConnectWallet } from './ConnectWallet';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#15202B] to-[#192734]">
      <Sidebar />
      
      {/* Connect Wallet Button */}
      <div className="fixed top-4 right-4 z-50">
        <ConnectWallet />
      </div>

      <main className="lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};