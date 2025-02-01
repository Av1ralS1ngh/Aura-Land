'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from './GameScene';

interface GameCanvasProps {
  isPaused?: boolean;
}

export default function GameCanvas({ isPaused = false }: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<GameScene | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      // Calculate game size (70% of viewport width, maintain 4:3 ratio)
      const gameWidth = Math.min(window.innerWidth * 0.7, 1024);
      const gameHeight = (gameWidth / 4) * 3;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: gameWidth,
        height: gameHeight,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scene: GameScene,
        parent: 'game-container',
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      gameRef.current = new Phaser.Game(config);

      // Store reference to the scene
      gameRef.current.events.once('ready', () => {
        sceneRef.current = gameRef.current?.scene.getScene('GameScene') as GameScene;
      });

      // Handle resize
      const handleResize = () => {
        if (gameRef.current) {
          const newWidth = Math.min(window.innerWidth * 0.7, 1024);
          const newHeight = (newWidth / 4) * 3;
          gameRef.current.scale.resize(newWidth, newHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
          sceneRef.current = null;
        }
      };
    }
  }, []);

  // Handle pause state changes
  useEffect(() => {
    if (sceneRef.current) {
      if (isPaused) {
        sceneRef.current.pauseGame();
      } else {
        sceneRef.current.resumeGame();
      }
    }
  }, [isPaused]);

  return (
    <div className="flex justify-center items-center h-full">
      <div id="game-container" className="rounded-lg overflow-hidden shadow-2xl" />
    </div>
  );
}
