'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/contract-config';

interface BlockchainContextType {
  mintCharacterNFTs: () => Promise<string>;
  isLoading: boolean;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const { user, sendTransaction } = usePrivy();
  const [isLoading, setIsLoading] = React.useState(false);

  const mintCharacterNFTs = useCallback(async () => {
    if (!user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      
      const data = contract.methods.mintNFTs().encodeABI();
      
      const txHash = await sendTransaction({
        to: CONTRACT_ADDRESS,
        data,
      });

      return txHash;
    } catch (error) {
      console.error('Error minting NFTs:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, sendTransaction]);

  const value = {
    mintCharacterNFTs,
    isLoading,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}
