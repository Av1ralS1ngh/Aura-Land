'use client';

import { useState } from 'react';
import { useNFTInventory } from '@/hooks/useNFTInventory';
import NFTModal from './NFTModal';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const renderInventoryContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full px-4">
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
        title: "",
        description: (
          <div 
            className="group flex flex-col items-center bg-black/40 rounded-xl overflow-hidden border border-gray-800/50 hover:border-purple-500/50 transition-all cursor-pointer aspect-square"
            onClick={() => handleNFTClick(tokenId)}
          >
            <div className="w-full relative flex-1">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
              <Image
                src={nft.image}
                alt={nft.name}
                fill
                className="object-cover transition-all group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
            <div className="w-full p-2 flex justify-between items-center bg-black/40 relative z-20">
              <h3 className="text-sm font-medium text-gray-100 group-hover:text-white">
                {nft.name}
              </h3>
              <Badge 
                variant="secondary" 
                className={cn(
                  "bg-purple-500/20 text-purple-300 group-hover:bg-purple-500/30",
                  "transition-colors duration-200"
                )}
              >
                Skill: {nft.skill}
              </Badge>
            </div>
          </div>
        ),
        link: "#",
      };
    }).filter(Boolean) as { title: string; description: React.ReactNode; link: string }[];

    // Calculate rows needed to show 2 items per column
    const rows = Math.ceil(items.length / 3);
    const itemsPerColumn = 2;
    const columns = 3;

    return (
      <div className="w-full px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 auto-rows-min gap-4">
            {Array.from({ length: Math.min(rows * columns, items.length) }).map((_, index) => {
              const item = items[index];
              if (!item) return null;
              return (
                <div key={index} className="h-[200px]">
                  {item.description}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full p-4">
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-gray-900/50 border border-gray-800 rounded-xl mb-6">
          <TabsTrigger 
            value="inventory" 
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-lg"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger 
            value="chatbot"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-lg"
          >
            Chatbot
          </TabsTrigger>
          <TabsTrigger 
            value="marketplace"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-lg"
          >
            Marketplace
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="w-full">
          <ScrollArea className="h-[calc(100vh-14rem)] w-full">
            {renderInventoryContent()}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="chatbot" className="w-full">
          <div className="text-center p-8 text-gray-400">
            Chatbot interface coming soon...
          </div>
        </TabsContent>
        <TabsContent value="marketplace" className="w-full">
          <div className="text-center p-8 text-gray-400">
            AI Agent Marketplace coming soon...
          </div>
        </TabsContent>
      </Tabs>
      {selectedTokenId && (
        <NFTModal
          tokenId={selectedTokenId}
          metadata={metadata[selectedTokenId]}
          onClose={() => setSelectedTokenId(null)}
        />
      )}
    </div>
  );
}
