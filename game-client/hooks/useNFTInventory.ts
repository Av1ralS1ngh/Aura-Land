import { useState, useEffect } from 'react';
import { usePrivyWallet } from './usePrivyWallet';
import { NFTMetadata } from '@/types/nft';
import { ERC721_ABI } from '@/lib/contracts/abi/erc_721';
import { CONTRACT_ADDRESS_NFT_MINTER } from '@/lib/contracts/contract-config';

const METADATA_BASE_URL = 'https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/';

export function useNFTInventory() {
  const [tokenIds, setTokenIds] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, NFTMetadata>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { address, authenticated, signer } = usePrivyWallet();

  useEffect(() => {
    let mounted = true;

    const fetchNFTs = async () => {
      if (!address || !authenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const web3 = await signer();
        
        // Create contract instance
        const contract = new web3.eth.Contract(ERC721_ABI as any, CONTRACT_ADDRESS_NFT_MINTER);

        // Get all token IDs (for testing, we'll use a fixed range)
        const testTokenIds = Array.from({ length: 5 }, (_, i) => i + 1);
        const ownedTokenIds = [];

        // Check ownership of each token
        for (const tokenId of testTokenIds) {
          try {
            const owner = await contract.methods.ownerOf(tokenId).call();
            if (owner.toLowerCase() === address.toLowerCase()) {
              ownedTokenIds.push(tokenId.toString());
            }
          } catch (err) {
            console.log(`Token ${tokenId} might not exist or other error:`, err);
          }
        }

        if (mounted) {
          setTokenIds(ownedTokenIds);
          
          // Fetch metadata for each owned token
          const metadataPromises = ownedTokenIds.map(id => 
            fetch(`${METADATA_BASE_URL}${id}.json`)
              .then(res => res.json())
              .catch(err => {
                console.error(`Error fetching metadata for token ${id}:`, err);
                return null;
              })
          );

          const metadataResults = await Promise.all(metadataPromises);
          const metadataMap = ownedTokenIds.reduce((acc, id, index) => {
            if (metadataResults[index]) {
              acc[id] = metadataResults[index];
            }
            return acc;
          }, {} as Record<string, NFTMetadata>);

          setMetadata(metadataMap);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        if (mounted) {
          setError('Failed to fetch NFTs');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNFTs();
    
    return () => {
      mounted = false;
    };
  }, [address, authenticated, signer]);

  return { tokenIds, metadata, isLoading, error };
}
