import express from 'express';
import "dotenv/config"
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/Db.js';
import userRouter from './routes/Userroutes.js';
import messagerouter from './routes/Messageroute.js';
import { Server } from 'socket.io';
import { setIO, UserSocketMap } from './lib/socket.js';

//Create express app and server
const app = express();
const server = http.createServer(app);

//instialize socket io
export const io = new Server(server,{
    cors: {origin: "*"}
})

// expose io to other modules
setIO(io);

//Store online users
// UserSocketMap is managed in lib/socket.js

//Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if (userId) UserSocketMap[userId] = socket.id;

    //emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(UserSocketMap));

    socket.on("join-groups", (groupIds) => {
        if (!Array.isArray(groupIds)) return;
        groupIds.forEach((groupId) => {
            if (groupId) socket.join(`group-${groupId}`);
        });
    });

    socket.on("disconnect",() => {
        console.log("User disconnected", userId);
        delete UserSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(UserSocketMap));
    })
})

//Middlewares setups
app.use(express.json({limit:'16mb'}))
app.use(cors());

//Define routes
app.use("/api/status", (req, res) => res.json({ status: "server is live" }));
app.use("/api/user", userRouter);
// keep legacy /api/auth path for frontend compatibility
app.use("/api/auth", userRouter);
app.use("/api/message", messagerouter);



//Connect to database
await connectDB();

const PORT =process.env.PORT || 5002;
server.listen(PORT, ()=>console.log("server is running on port:"+ PORT));