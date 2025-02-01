'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Web3 from 'web3';
import { CONTRACT_ABI_MINTER } from '../contracts/abi/token_minter';
import { CONTRACT_ADDRESS_MINTER, CONTRACT_ADDRESS_NFT_MINTER } from '../contracts/contract-config';
import { CONTRACT_ABI_NFT_MINTER } from '../contracts/abi/nft_minter';

interface BlockchainContextType {
  mintTokens: (getSigner: () => Promise<any>) => Promise<string>;
  mintNFTs: (getSigner: () => Promise<any>) => Promise<string>;
  tokenURI: (tokenId: string) => Promise<string>;
  mintCustomNFT: (tokenId: number, price: number) => Promise<any>;
  isLoadingTokens: boolean;
  isLoadingNFTs: boolean;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const { user } = usePrivy();
  const [isLoadingTokens, setIsLoadingTokens] = React.useState(false);
  const [isLoadingNFTs, setIsLoadingNFTs] = React.useState(false);

  const mintTokens = useCallback(async (getSigner: () => Promise<any>) => {
    if (!user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoadingTokens(true);
      const web3 = await getSigner();
      
      // Create contract instance
      const contract = new web3.eth.Contract(
        CONTRACT_ABI_MINTER,
        CONTRACT_ADDRESS_MINTER
      );

      // Estimate gas for mint
      const gasEstimate = await contract.methods.mint(user.wallet.address, "5")
        .estimateGas({ from: user.wallet.address });

      // Add 20% buffer to gas estimate
      const gasWithBuffer = BigInt(gasEstimate) + 
        (BigInt(gasEstimate) * BigInt(20) / BigInt(100));

      // Call mint function with 5000 tokens (with 18 decimals)
      const tx = await contract.methods.mint(user.wallet.address, "500")
        .send({ 
          from: user.wallet.address,
          gas: gasWithBuffer.toString()
        });

      return tx.transactionHash;
    } catch (error) {
      console.error('Error in mintTokens:', error);
      throw error;
    } finally {
      setIsLoadingTokens(false);
    }
  }, [user?.wallet?.address]);

  const mintNFTs = useCallback(async (getSigner: () => Promise<any>) => {
    return;
    if (!user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoadingNFTs(true);
      const web3 = await getSigner();
      
      const contract = new web3.eth.Contract(
        CONTRACT_ABI_NFT_MINTER,
        CONTRACT_ADDRESS_NFT_MINTER
      );
      console.log(contract);
      console.log(contract.methods);
      const gasEstimate = await contract.methods.mint("5")
        .estimateGas({ from: user.wallet.address });

      const gasWithBuffer = BigInt(gasEstimate) + 
        (BigInt(gasEstimate) * BigInt(20) / BigInt(100));

      const tx = await contract.methods.mint("5")
        .send({ 
          from: user.wallet.address,
          gas: gasWithBuffer.toString()
        });

      return tx.transactionHash;
    } catch (error) {
      console.error('Error in mintNFTs:', error);
      throw error;
    } finally {
      setIsLoadingNFTs(false);
    }
  }, [user?.wallet?.address]);

  const tokenURI = useCallback(async (tokenId: string): Promise<string> => {
    if (!user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(
        CONTRACT_ABI_NFT_MINTER,
        CONTRACT_ADDRESS_NFT_MINTER
      );

      const uri = await contract.methods.tokenURI(tokenId).call();
      console.log(`Token URI for ID ${tokenId}:`, uri);
      return uri;
    } catch (error) {
      console.error(`Error fetching token URI for ID ${tokenId}:`, error);
      throw error;
    }
  }, [user?.wallet?.address]);

  const mintCustomNFT = useCallback(async (tokenId: number, price: number) => {
    try {
      if (!user?.wallet?.address) {
        throw new Error("Wallet not connected");
      }

      const web3 = new Web3(window.ethereum);
      const nftMinterContract = new web3.eth.Contract(
        CONTRACT_ABI_NFT_MINTER,
        CONTRACT_ADDRESS_NFT_MINTER
      );

      const contract = new web3.eth.Contract(
        CONTRACT_ABI_MINTER,
        CONTRACT_ADDRESS_MINTER
      );

      // Convert price to string and ensure it's a whole number
      const priceString = Math.floor(price).toString();

      // First burn the tokens
      const gasEstimate = await contract.methods
        .burn(user.wallet.address, priceString)
        .estimateGas({ from: user.wallet.address });

      const gasWithBuffer = BigInt(gasEstimate) +
        (BigInt(gasEstimate) * BigInt(20) / BigInt(100));

      await contract.methods
        .burn(user.wallet.address, priceString)
        .send({ 
          from: user.wallet.address,
          gas: gasWithBuffer.toString()
        });

      // Then mint the NFT
      const tx = await nftMinterContract.methods.mintNFTfromID(tokenId).send({ 
        from: user.wallet.address,
      });
      
      return tx;
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
  }, [user?.wallet?.address]);

  const value = {
    mintTokens,
    mintNFTs,
    tokenURI,
    mintCustomNFT,
    isLoadingTokens,
    isLoadingNFTs
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
