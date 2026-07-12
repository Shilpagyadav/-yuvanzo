const socketIO = require('socket.io');

let io;

function initSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);

    socket.on('track-order', (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`📦 Client joined order-${orderId}`);
    });

    socket.on('update-location', (data) => {
      io.to(`order-${data.orderId}`).emit('location-updated', data);
    });

    socket.on('order-status-update', (data) => {
      io.to(`order-${data.orderId}`).emit('status-updated', data);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = { initSocket, getIO };