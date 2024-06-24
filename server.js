const { Server } = require('socket.io');
require('dotenv').config();

const PORT = process.env.PORT || 8080;
const FE_URL = process.env.FE_URL;

const io = new Server({
    cors: {
        origin: FE_URL,
    },
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
    !onlineUsers.some(user => user.userId === userId) &&
        onlineUsers.push({ userId, socketId });
};

const removeUser = socketId => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socketId);
};

const getUser = userId => {
    return onlineUsers.find(user => user.userId === userId);
};

io.on('connection', socket => {
    socket.on('join', ({ userId }) => {
        addUser(userId, socket.id);
        console.log('online users: ', onlineUsers);
    });

    // console.log('a user connected, socket id: ', socket.id);

    socket.on('sendNotification', data => {
        if (data.type === 'USER') {
            const user = getUser(data.receivers);
            if (user) {
                io.to(user.socketId).emit('getNotification', data);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
        removeUser(socket.id);
    });
});

io.listen(PORT);
