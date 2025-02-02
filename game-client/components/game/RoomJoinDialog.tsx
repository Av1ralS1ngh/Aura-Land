import React, { useState } from 'react';
import { useMultiplayer } from '@/lib/context/MultiplayerContext';

interface RoomJoinDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoomJoinDialog({ isOpen, onClose }: RoomJoinDialogProps) {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const { joinRoom } = useMultiplayer();

  if (!isOpen) return null;

  const handleJoin = () => {
    if (roomId && playerName) {
      joinRoom(roomId, playerName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-white">Join Game Room</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Room ID
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              placeholder="Enter room ID"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
              disabled={!roomId || !playerName}
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
