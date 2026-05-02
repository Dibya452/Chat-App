// Helper to store and retrieve socket.io instance and user socket map
export const UserSocketMap = {}; // { userId: socketId }

let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;
