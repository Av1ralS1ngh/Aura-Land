import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNFTInventory } from '@/hooks/useNFTInventory';

interface TradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  npcName: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

const npcDialogs = [
  "Hello fellow, want to buy some NFTs?",
  "I've got something special for you today...",
  "This one is quite rare, I must say...",
  "Ah, a discerning collector, I see!",
];

export default function TradeDialog({ isOpen, onClose, npcName }: TradeDialogProps) {
  const [selectedNFT, setSelectedNFT] = useState<number | null>(null);
  const [nftPrice, setNftPrice] = useState<number | null>(null);
  const [showBattleOffer, setShowBattleOffer] = useState(false);
  const [npcMessage, setNpcMessage] = useState(npcDialogs[0]);
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null);
  const { tokenIds } = useNFTInventory();

  useEffect(() => {
    if (isOpen) {
      // Generate a random NFT ID that's not in the user's inventory
      let availableIds = Array.from({ length: 1200 }, (_, i) => i + 1)
        .filter(id => !tokenIds.includes(id.toString()));
      
      if (availableIds.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableIds.length);
        const randomNFTId = availableIds[randomIndex];
        setSelectedNFT(randomNFTId);
        
        // Generate random price between 273 and 320 CoA
        const randomPrice = Math.floor(Math.random() * (320 - 273 + 1)) + 273;
        setNftPrice(randomPrice);
        
        // Set random initial dialog
        const randomDialog = Math.floor(Math.random() * npcDialogs.length);
        setNpcMessage(npcDialogs[randomDialog]);

        // Fetch NFT metadata
        fetch(`https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/${randomNFTId}.json`)
          .then(response => response.json())
          .then(data => setNftMetadata(data))
          .catch(error => console.error('Error fetching NFT metadata:', error));
      }
    } else {
      setNftMetadata(null);
      setSelectedNFT(null);
      setShowBattleOffer(false);
    }
  }, [isOpen, tokenIds]);

  const handleBattleClick = () => {
    setNpcMessage("You think you can defeat me? Prove that and get 30% discount!");
    setShowBattleOffer(true);
  };

  const startBattle = () => {
    // TODO: Implement battle logic
    onClose();
  };

  const discountedPrice = nftPrice ? Math.floor(nftPrice * 0.7) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Trading with {npcName}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {npcMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* NFT Section */}
          {selectedNFT && nftPrice && nftMetadata && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-start space-x-6">
                <div className="relative w-48 h-48">
                  <Image
                    src={nftMetadata.image}
                    alt={nftMetadata.name}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{nftMetadata.name}</h3>
                  <p className="text-gray-400 mb-2">{nftMetadata.description}</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {nftMetadata.attributes.map((attr, index) => (
                      <div key={index} className="bg-gray-700 p-2 rounded">
                        <span className="text-gray-400">{attr.trait_type}: </span>
                        <span className="text-white">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-yellow-400 text-lg mb-4">
                    {showBattleOffer ? (
                      <span className="flex items-center gap-2">
                        <span className="line-through text-gray-500">{nftPrice} CoA</span>
                        <span>{discountedPrice} CoA</span>
                        <span className="text-green-400 text-sm">(30% off)</span>
                      </span>
                    ) : (
                      `${nftPrice} CoA`
                    )}
                  </p>
                  <div className="space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // TODO: Implement buy functionality
                        console.log(`Buying NFT #${selectedNFT}`);
                      }}
                    >
                      Buy NFT
                    </Button>
                    {!showBattleOffer && (
                      <Button
                        variant="outline"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleBattleClick}
                      >
                        Challenge to Battle
                      </Button>
                    )}
                    {showBattleOffer && (
                      <Button
                        variant="outline"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={startBattle}
                      >
                        Start Battle
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
