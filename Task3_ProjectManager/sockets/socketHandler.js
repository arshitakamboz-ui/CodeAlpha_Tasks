// This function is called once from server.js and wires up all socket events.
module.exports = function initSockets(io) {
  io.on('connection', (socket) => {
    // Each connected browser tells us which project board it's viewing,
    // so we can broadcast updates only to people looking at that project.
    socket.on('joinProject', (projectId) => {
      socket.join(`project_${projectId}`);
    });

    socket.on('leaveProject', (projectId) => {
      socket.leave(`project_${projectId}`);
    });

    // Each logged-in user also joins a personal room (their own user ID)
    // so we can send THEM notifications no matter what page they're on.
    socket.on('joinUserRoom', (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
      // nothing special needed, socket.io cleans up rooms automatically
    });
  });
};
