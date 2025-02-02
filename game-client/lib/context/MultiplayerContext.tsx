'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface Player {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
}

interface RoomState {
  id: string;
  playerName: string;
}

interface MultiplayerContextType {
  socket: Socket | null;
  players: Map<string, Player>;
  currentRoom: RoomState | null;
  joinRoom: (roomId: string, playerName: string) => void;
  leaveRoom: () => void;
  updatePosition: (x: number, y: number) => void;
}

const MultiplayerContext = createContext<MultiplayerContextType>({
  socket: null,
  players: new Map(),
  currentRoom: null,
  joinRoom: () => {},
  leaveRoom: () => {},
  updatePosition: () => {},
});

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};

export const MultiplayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [currentRoom, setCurrentRoom] = useState<RoomState | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('roomState', (roomPlayers: Player[]) => {
      console.log('Received room state:', roomPlayers);
      const newPlayers = new Map();
      roomPlayers.forEach(player => {
        newPlayers.set(player.id, player);
      });
      setPlayers(newPlayers);
    });

    newSocket.on('playerJoined', (player: Player) => {
      console.log('Player joined:', player);
      setPlayers(prev => new Map(prev).set(player.id, player));
    });

    newSocket.on('playerLeft', (playerId: string) => {
      console.log('Player left:', playerId);
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        newPlayers.delete(playerId);
        return newPlayers;
      });
    });

    newSocket.on('playerMoved', ({ id, position }) => {
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        const player = newPlayers.get(id);
        if (player) {
          player.position = position;
          newPlayers.set(id, player);
        }
        return newPlayers;
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (roomId: string, playerName: string) => {
    if (socket) {
      socket.emit('joinRoom', { roomId, playerName });
      setCurrentRoom({ id: roomId, playerName });
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leaveRoom');
      setCurrentRoom(null);
      setPlayers(new Map());
    }
  };

  const updatePosition = (x: number, y: number) => {
    if (socket) {
      socket.emit('updatePosition', { x, y });
    }
  };

  const value = {
    socket,
    players,
    currentRoom,
    joinRoom,
    leaveRoom,
    updatePosition,
  };

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
};
