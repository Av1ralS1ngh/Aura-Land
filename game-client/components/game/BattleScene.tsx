import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface BattleSceneProps {
  isVisible: boolean;
  playerNFT: any;
  npcNFT: any;
  onBattleEnd: (playerWon: boolean) => void;
}

export default function BattleScene({ isVisible, playerNFT, npcNFT, onBattleEnd }: BattleSceneProps) {
  console.log("BattleScene", isVisible);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const battleCheckInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!containerRef.current || !isVisible) return;

    // Setup Three.js scene for visual effects
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create lightning effect
    const createLightning = () => {
      const points = [];
      const segments = 10;
      for (let i = 0; i <= segments; i++) {
        points.push(new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          i / segments * 4 - 2,
          0
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
      return new THREE.Line(geometry, material);
    };

    // Add multiple lightning bolts
    const lightnings: THREE.Line[] = [];
    for (let i = 0; i < 5; i++) {
      const lightning = createLightning();
      scene.add(lightning);
      lightnings.push(lightning);
    }

    // Animation loop
    const animate = () => {
      if (!isVisible) return;
      
      requestAnimationFrame(animate);

      // Animate lightning
      lightnings.forEach(lightning => {
        const positions = lightning.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += (Math.random() - 0.5) * 0.1;
        }
        lightning.geometry.attributes.position.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Start checking battle status
    battleCheckInterval.current = setInterval(() => {
      const gameScene = (window as any).gameScene;
      if (gameScene && gameScene.isBattling) {
        // Check if either player or NPC is dead
        if (gameScene.playerHealth <= 0 || gameScene.npcHealth <= 0) {
          const playerWon = gameScene.npcHealth <= 0;
          clearInterval(battleCheckInterval.current!);
          gameScene.endNPCBattle();
          onBattleEnd(playerWon);
        }
      }
    }, 100);

    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }

      // Clear battle check interval
      if (battleCheckInterval.current) {
        clearInterval(battleCheckInterval.current);
      }
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50">
          {/* Three.js container for effects */}
          <div ref={containerRef} className="absolute inset-0" />

          {/* Battle UI */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {/* Player Info */}
            <div className="bg-black bg-opacity-50 p-4 rounded-lg">
              <div className="w-32 h-32 relative mb-2">
                <Image
                  src={playerNFT.image}
                  alt={playerNFT.name}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="text-white text-center">{playerNFT.name}</div>
            </div>

            {/* Battle Instructions */}
            <div className="bg-black bg-opacity-50 p-4 rounded-lg text-white text-center">
              <p className="text-xl font-bold mb-2">Battle Controls</p>
              <p>SPACE - Sword Attack</p>
              <p>SHIFT - Cast Spell</p>
            </div>

            {/* NPC Info */}
            <div className="bg-black bg-opacity-50 p-4 rounded-lg">
              <div className="w-32 h-32 relative mb-2">
                <Image
                  src={npcNFT.image}
                  alt={npcNFT.name}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="text-white text-center">{npcNFT.name}</div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
