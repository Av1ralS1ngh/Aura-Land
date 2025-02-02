'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import MobileError from '@/components/MobileError';
import CharacterSelectionModal from '@/components/game/CharacterSelectionModal';
import GameCanvas from '@/components/game/GameCanvas';
import TradeDialog from '@/components/game/TradeDialog';
import AchievementDialog from '@/components/game/AchievementDialog';
import GameBackground from '@/components/game/GameBackground';
import GameWallet from '@/components/wallet/GameWallet';
import GameInventory from '@/components/inventory/GameInventory';
import RoomJoinDialog from '@/components/game/RoomJoinDialog';
import { BlockchainProvider } from '@/lib/context/BlockchainContext';
import { MultiplayerProvider, useMultiplayer } from '@/lib/context/MultiplayerContext';
import { motion } from 'framer-motion';

function GameContent() {
  const [isMobile, setIsMobile] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(true);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [tradingNPC, setTradingNPC] = useState('');
  const [isBattling, setIsBattling] = useState(false);
  const [playerGold, setPlayerGold] = useState(0);
  const [showGoldAchievement, setShowGoldAchievement] = useState(false);
  const { ready, authenticated } = usePrivy();
  const { currentRoom, leaveRoom } = useMultiplayer();

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

  if (!ready) return null;
  if (!authenticated) return <div>Please connect your wallet to play</div>;
  if (isMobile) return <MobileError />;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Room Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
        {currentRoom ? (
          <>
            <div className="bg-gray-800 text-white px-4 py-2 rounded-md">
              Room: {currentRoom.id}
            </div>
            <button
              onClick={leaveRoom}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
            >
              Leave Room
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowRoomDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          >
            Join Room
          </button>
        )}
      </div>

      {/* Background */}
      <GameBackground />

      {/* Main content */}
      <div className="relative z-10 flex w-full h-full">
        {/* Game Container with centering wrapper */}
        <motion.div 
          className="relative"
          animate={{ 
            width: isBattling ? '100%' : '70%',
          }}
          transition={{ 
            duration: 0.5, 
            ease: "easeInOut" 
          }}
        >
          {/* Game Canvas Container */}
          <motion.div 
            className="h-full relative"
            animate={{ 
              width: isBattling ? '100%' : '100%',
              left: isBattling ? '50%' : '0%',
              x: isBattling ? '-50%' : '0%',
            }}
            transition={{ 
              duration: 0.5, 
              ease: "easeInOut",
            }}
          >
            <div className="h-full z-10" style={{ 
              width: isBattling ? '100%' : '100%', 
              margin: isBattling ? '0 auto' : '0',
              justifyContent: isBattling ? 'center' : 'flex-start',
              alignSelf: isBattling ? 'center' : 'flex-start',
            }}>
              <GameCanvas 
                isPaused={isGamePaused} 
                onPause={() => setIsGamePaused(true)}
                onResume={() => setIsGamePaused(false)}
                onOpenTrade={(npcName: string) => {
                  setTradingNPC(npcName);
                  setShowTradeDialog(true);
                }}
              />
            </div>  
          </motion.div>
        </motion.div>

        {/* Sidebar */}
        <motion.div 
          className="w-[30%] min-w-[300px] h-full bg-black bg-opacity-50 flex flex-col"
          animate={{ 
            x: isBattling ? '100%' : 0,
            opacity: isBattling ? 0 : 1
          }}
          transition={{ 
            duration: 0.5, 
            ease: "easeInOut",
            opacity: { duration: 0.3 }
          }}
        >
          {/* Inventory section */}
          <div className="flex-1 p-4 min-h-0 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-white">Inventory</h2>
            <div className="flex-1 min-h-0 rounded-lg bg-gray-800 bg-opacity-50 p-4 overflow-y-auto">
              <GameInventory onNFTClick={() => setIsGamePaused(true)} />
            </div>
          </div>

          {/* Wallet section */}
          <div className="p-4">
            <GameWallet />
          </div>
        </motion.div>
      </div>

      <CharacterSelectionModal
        isOpen={showCharacterModal}
        onClose={() => setShowCharacterModal(false)}
      />
      {/* Trade Dialog */}
      <TradeDialog
        isOpen={showTradeDialog}
        onClose={() => {
          setShowTradeDialog(false);
          setIsGamePaused(false);
        }}
        npcName={tradingNPC}
      />
      <AchievementDialog
        isOpen={showGoldAchievement}
        onClose={() => setShowGoldAchievement(false)}
        goldAmount={playerGold}
        onGamePause={() => setIsGamePaused(true)}
        onGameResume={() => setIsGamePaused(false)}
      />
      <RoomJoinDialog
        isOpen={showRoomDialog}
        onClose={() => setShowRoomDialog(false)}
      />
    </div>
  );
}

export default function GamePage() {
  return (
    <BlockchainProvider>
      <MultiplayerProvider>
        <GameContent />
      </MultiplayerProvider>
    </BlockchainProvider>
  );
}
