import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  npcName: string;
}

const tradeItems = [
  { name: 'Health Potion', price: 50, description: 'Restores 50 HP' },
  { name: 'Mana Potion', price: 75, description: 'Restores 50 MP' },
  { name: 'Strength Potion', price: 100, description: '+10 Strength for 60s' },
];

export default function TradeDialog({ isOpen, onClose, npcName }: TradeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Trading with {npcName}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Select items to buy or sell
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          {tradeItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
            >
              <div>
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-yellow-400">{item.price} Gold</span>
                <Button
                  variant="outline"
                  onClick={() => {
                    // TODO: Implement buy functionality
                    console.log(`Buying ${item.name}`);
                  }}
                >
                  Buy
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
