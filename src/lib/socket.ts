import { io } from 'socket.io-client';
import { useStore } from '../store/useStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
});

export const useSocket = () => {
  const addNotification = useStore((state) => state.addNotification);

  const connect = (userId: string) => {
    socket.auth = { userId };
    socket.connect();

    socket.on('match', (data) => {
      addNotification({
        type: 'match',
        data,
        timestamp: new Date(),
      });
    });

    socket.on('message', (data) => {
      addNotification({
        type: 'message',
        data,
        timestamp: new Date(),
      });
    });
  };

  return { connect };
};