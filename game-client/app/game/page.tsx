'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import MobileError from '@/components/MobileError';
import CharacterSelectionModal from '@/components/game/CharacterSelectionModal';
import GameCanvas from '@/components/game/GameCanvas';
import GameBackground from '@/components/game/GameBackground';
import GameWallet from '@/components/wallet/GameWallet';
import { BlockchainProvider } from '@/lib/context/BlockchainContext';

export default function GamePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(true);
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
            <CharacterSelectionModal 
              isOpen={showCharacterModal} 
              onClose={() => setShowCharacterModal(false)} 
            />
            {!showCharacterModal && <GameCanvas />}
          </div>

          {/* Sidebar */}
          <div className="w-[30%] min-w-[300px] h-full bg-black bg-opacity-50 p-4 flex flex-col">
            {/* Inventory section */}
            <div className="flex-1 mb-4">
              <h2 className="text-xl font-bold mb-4 text-white">Inventory</h2>
              <div className="h-full rounded-lg bg-gray-800 bg-opacity-50 p-4">
                {/* Inventory content will go here */}
              </div>
            </div>

            {/* Wallet section */}
            <div className="h-auto">
              <GameWallet />
            </div>
          </div>
        </div>
      </div>
    </BlockchainProvider>
  );
}
