'use client';

import { Button } from "@/components/ui/button";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { login, isAuthenticated, isReady } = usePrivyAuth();
  const router = useRouter();

  const handleGameLaunch = () => {
    router.push('/game');
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Welcome to the Game</h1>
      {!isAuthenticated ? (
        <Button 
          onClick={login}
          size="lg"
          className="text-lg"
        >
          Connect Wallet
        </Button>
      ) : (
        <Button 
          onClick={handleGameLaunch}
          size="lg"
          className="text-lg"
        >
          Launch Game
        </Button>
      )}
    </div>
  );
}
