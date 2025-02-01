'use client';

import { NFTMetadata } from '@/types/nft';
import Image from 'next/image';

interface NFTModalProps {
  metadata: NFTMetadata;
  onClose: () => void;
}

export default function NFTModal({ metadata, onClose }: NFTModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Image */}
          <div className="w-full md:w-1/2">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={metadata.image}
                alt={metadata.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl font-bold text-white mb-2">{metadata.name}</h2>
            <p className="text-gray-400 mb-4">{metadata.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400">Rarity</div>
                <div className="text-xl font-bold text-white">
                  {(metadata.rarity * 100).toFixed(2)}%
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400">Skill Level</div>
                <div className="text-xl font-bold text-white">
                  {metadata.skill}
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white mb-2">Attributes</h3>
              <div className="grid grid-cols-2 gap-2">
                {metadata.attributes.map((attr, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 rounded-lg p-2"
                  >
                    <div className="text-sm text-gray-400">{attr.trait_type}</div>
                    <div className="text-white font-medium">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
