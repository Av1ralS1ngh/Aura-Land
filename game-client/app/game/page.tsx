'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import MobileError from '@/components/MobileError';
import CharacterSelectionModal from '@/components/game/CharacterSelectionModal';
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
      <div className="w-full h-screen bg-gray-900 text-white">
        <CharacterSelectionModal 
          isOpen={showCharacterModal} 
          onClose={() => setShowCharacterModal(false)} 
        />
        
        {/* Game content will be added here */}
        <div className="p-4">
          <h1 className="text-2xl font-bold">Game World</h1>
          {/* Add game canvas/content here */}
        </div>
      </div>
    </BlockchainProvider>
  );
}
