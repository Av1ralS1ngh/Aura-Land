'use client';

import { useState } from 'react';
import { useNFTInventory } from '@/hooks/useNFTInventory';
import NFTModal from './NFTModal';
import Image from 'next/image';
import { HoverEffect } from '@/components/ui/card-hover-effect';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GameInventoryProps {
  onNFTClick: () => void;
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
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="p-0">
              <Skeleton className="w-full aspect-square rounded-t-xl" />
            </div>
            <div className="p-2">
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center p-4 bg-red-900/20 rounded-lg border border-red-800">
        {error}
      </div>
    );
  }

  const items = tokenIds.map((tokenId) => {
    const nft = metadata[tokenId];
    console.log(nft);
    if (!nft) return null;

    return {
      title: nft.name,
      description: (
        <div className="flex flex-col gap-2">
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <Image
              src={nft.image}
              alt={nft.name}
              fill
              className="object-cover transition-all"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
          <Badge 
            variant="secondary" 
            className={cn(
              "w-fit bg-purple-500/20 text-purple-300 hover:bg-purple-500/30",
              "transition-colors duration-200"
            )}
          >
            Skill: {nft.skill}
          </Badge>
        </div>
      ),
      link: "#",
    };
  }).filter(Boolean) as { title: string; description: React.ReactNode; link: string }[];

  return (
    <>
      <ScrollArea className="h-full w-full pr-4">
        <div className="pb-4" onClick={(e) => {
          const link = (e.target as HTMLElement).closest('a');
          if (link) {
            e.preventDefault();
            const index = items.findIndex(item => item.link === link.getAttribute('href'));
            if (index !== -1) {
              handleNFTClick(tokenIds[index]);
            }
          }
        }}>
          <HoverEffect 
            items={items} 
            className="grid-cols-3 !py-0"
          />
        </div>
      </ScrollArea>

      {selectedTokenId && metadata[selectedTokenId] && (
        <NFTModal
          metadata={metadata[selectedTokenId]}
          onClose={() => setSelectedTokenId(null)}
        />
      )}
    </>
  );
}
