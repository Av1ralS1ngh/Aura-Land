'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import MobileError from '@/components/MobileError';
import CharacterSelectionModal from '@/components/game/CharacterSelectionModal';
import GameCanvas from '@/components/game/GameCanvas';
import TradeDialog from '@/components/game/TradeDialog';
import GameBackground from '@/components/game/GameBackground';
import GameWallet from '@/components/wallet/GameWallet';
import GameInventory from '@/components/inventory/GameInventory';
import { BlockchainProvider } from '@/lib/context/BlockchainContext';

export default function GamePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(true);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [tradingNPC, setTradingNPC] = useState('');
  const { ready, authenticated } = usePrivy();

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkDevice();

    // Add resize listener
    window.addEventListener('resize', checkDevice);

    // Cleanup
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleNFTClick = () => {
    setIsGamePaused(true);
  };

  const handleNFTModalClose = () => {
    setIsGamePaused(false);
  };

  if (!ready) return null;
  if (!authenticated) return <div>Please connect your wallet to play</div>;
  if (isMobile) return <MobileError />;

  return (
    <BlockchainProvider>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Background */}
        <GameBackground />

        {/* Main content */}
        <div className="relative z-10 flex w-full h-full">
          {/* Game area */}
          <div className="flex-grow h-full">
            {/* <CharacterSelectionModal 
              isOpen={showCharacterModal} 
              onClose={() => setShowCharacterModal(false)} 
            /> */}
            {/* {!showCharacterModal && ( */}
            <GameCanvas 
              isPaused={isGamePaused} 
              onPause={() => setIsGamePaused(true)}
              onResume={() => setIsGamePaused(false)}
              onOpenTrade={(npcName: string) => {
                setTradingNPC(npcName);
                setShowTradeDialog(true);
              }}
            />
            {/* )} */}
          </div>

          {/* Sidebar */}
          <div className="w-[30%] min-w-[300px] h-full bg-black bg-opacity-50 flex flex-col">
            {/* Inventory section */}
            <div className="flex-1 p-4 min-h-0 flex flex-col">
              <h2 className="text-xl font-bold mb-4 text-white">Inventory</h2>
              <div className="flex-1 min-h-0 rounded-lg bg-gray-800 bg-opacity-50 p-4 overflow-y-auto">
                <GameInventory onNFTClick={handleNFTClick} />
              </div>
            </div>

            {/* Wallet section */}
            <div className="p-4">
              <GameWallet />
            </div>
          </div>

          {/* Trade Dialog */}
          <TradeDialog
            isOpen={showTradeDialog}
            onClose={() => {
              setShowTradeDialog(false);
              setIsGamePaused(false);
            }}
            npcName={tradingNPC}
          />
        </div>
      </div>
    </BlockchainProvider>
  );
}
