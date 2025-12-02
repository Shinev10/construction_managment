// frontend/src/socketClient.js
import { io } from 'socket.io-client';

const token = localStorage.getItem('token');

const socket = io('http://localhost:5000', {
  autoConnect: true,
  transports: ['websocket'],
  auth: { token },
});

// Useful debug logs (remove once stable)
socket.on('connect', () => console.log('⚡ socket connected', socket.id));
socket.on('connect_error', (err) => console.error('⚡ socket connect_error', err));
socket.on('disconnect', (reason) => console.log('⚡ socket disconnected', reason));

export default socket;
