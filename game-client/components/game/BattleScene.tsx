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
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!containerRef.current || !isVisible) return;

    // Setup Three.js scene
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

    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [isVisible]);

  const calculateWinner = () => {
    const playerScore = calculateNFTScore(playerNFT);
    const npcScore = calculateNFTScore(npcNFT);
    return playerScore >= npcScore;
  };

  const calculateNFTScore = (nft: any) => {
    let score = 0;
    nft.attributes.forEach((attr: any) => {
      if (attr.trait_type.toLowerCase().includes('rarity')) {
        score += parseInt(attr.value) * 2; // Rarity counts double
      } else if (
        attr.trait_type.toLowerCase().includes('strength') ||
        attr.trait_type.toLowerCase().includes('power') ||
        attr.trait_type.toLowerCase().includes('skill')
      ) {
        score += parseInt(attr.value);
      }
    });
    return score;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-80" />
          
          {/* Three.js container */}
          <div ref={containerRef} className="absolute inset-0" />

          {/* Battle content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative z-10 flex items-center justify-center gap-8"
          >
            {/* Player NFT */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-64 h-64 relative"
            >
              <Image
                src={playerNFT.image}
                alt={playerNFT.name}
                fill
                className="rounded-lg object-cover"
              />
            </motion.div>

            {/* VS Text */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl font-bold text-yellow-500 px-8"
            >
              VS
            </motion.div>

            {/* NPC NFT */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-64 h-64 relative"
            >
              <Image
                src={npcNFT.image}
                alt={npcNFT.name}
                fill
                className="rounded-lg object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Battle result */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-20 left-0 right-0 text-center"
          >
            <div className="text-4xl font-bold text-white mb-4">
              {calculateWinner() ? "You Won!" : "You Lost!"}
            </div>
            <button
              onClick={() => onBattleEnd(calculateWinner())}
              className="px-6 py-3 bg-yellow-500 text-black rounded-lg font-bold hover:bg-yellow-400"
            >
              Continue
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
