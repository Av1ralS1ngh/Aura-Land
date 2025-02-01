'use client';

import { useState } from 'react';
import { useNFTInventory } from '@/hooks/useNFTInventory';
import NFTModal from './NFTModal';
import Image from 'next/image';

interface GameInventoryProps {
  onNFTClick: () => void; // To pause the game
}

export default function GameInventory({ onNFTClick }: GameInventoryProps) {
  const { tokenIds, metadata, isLoading, error } = useNFTInventory();
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const handleNFTClick = (tokenId: string) => {
    onNFTClick();
    setSelectedTokenId(tokenId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto">
        {tokenIds.map((tokenId) => {
          const nft = metadata[tokenId];
          if (!nft) return null;

          return (
            <button
              key={tokenId}
              onClick={() => handleNFTClick(tokenId)}
              className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
            >
              <Image
                src={nft.image}
                alt={nft.name}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                <div className="text-sm text-white truncate">
                  {nft.name}
                </div>
                <div className="text-xs text-gray-300">
                  Skill: {nft.skill}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedTokenId && metadata[selectedTokenId] && (
        <NFTModal
          metadata={metadata[selectedTokenId]}
          onClose={() => setSelectedTokenId(null)}
        />
      )}
    </>
  );
}
