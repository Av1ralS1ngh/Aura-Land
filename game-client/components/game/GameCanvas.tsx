'use client';

import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { useMultiplayer } from '@/lib/context/MultiplayerContext';
import { GameScene } from './GameScene';

interface GameCanvasProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onOpenTrade: (npcName: string) => void;
}

export default function GameCanvas({
  isPaused,
  onPause,
  onResume,
  onOpenTrade,
}: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<GameScene | null>(null);
  const { players, updatePosition, socket, currentRoom } = useMultiplayer();

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      // Set socket and room on window object for the game scene
      (window as any).gameSocket = socket;
      (window as any).gameCurrentRoom = currentRoom;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
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
        },
        backgroundColor: '#2d2d2d',
        pixelArt: true,
        roundPixels: true
      };

      const game = new Phaser.Game(config);
      gameRef.current = game;

      // Get reference to the scene
      game.events.once('ready', () => {
        sceneRef.current = game.scene.getScene('GameScene') as GameScene;
        if (sceneRef.current) {
          sceneRef.current.events.on('positionUpdate', updatePosition);
        }
      });
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [socket, currentRoom]);

  // Handle game pause/resume
  useEffect(() => {
    if (sceneRef.current) {
      if (isPaused) {
        sceneRef.current.scene.pause();
      } else {
        sceneRef.current.scene.resume();
      }
    }
  }, [isPaused]);

  // Update other players when they change
  useEffect(() => {
    if (sceneRef.current) {
      const scene = sceneRef.current;
      
      // Clear all players first
      const currentPlayers = new Set(scene.getOtherPlayerIds());
      players.forEach((player) => {
        if (player.id !== scene.getPlayerId()) {
          if (!currentPlayers.has(player.id)) {
            // Add new player
            scene.addOtherPlayer(player.id, player.name, player.position.x, player.position.y);
          } else {
            // Update existing player
            scene.updateOtherPlayerPosition(player.id, player.position.x, player.position.y);
          }
          currentPlayers.delete(player.id);
        }
      });

      // Remove players that are no longer in the game
      currentPlayers.forEach(playerId => {
        scene.removeOtherPlayer(playerId);
      });
    }
  }, [players]);

  return (
    <div id="game-container" className="w-full h-full relative">
      <div id="game-canvas" className="w-full h-full" />
    </div>
  );
}
