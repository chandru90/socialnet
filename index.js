import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import http from "http";
import { Server } from "socket.io";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5172",
      "http://localhost:5173",
      "http://localhost:5174",
    ], // Add your frontend URL(s)
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const __dirname = path.resolve();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOptions = {
  origin: [
    "http://localhost:5172",
    "http://localhost:5173",
    "http://localhost:5174",
  ], // Add your frontend URL(s)
  credentials: true,
};
app.use(cors(corsOptions));

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

// Serve frontend
app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

const activeUsers = {};

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("registerUser", (username) => {
    activeUsers[username] = socket.id;
    console.log(`${username} registered`);
    io.emit("userListUpdate", Object.keys(activeUsers));
  });

  socket.on("sendMessage", (msg) => {
    const { receiver } = msg;
    const receiverSocketId = activeUsers[receiver];
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("receiveMessage", msg);
    } else {
      console.error(`User ${receiver} not found`);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    for (const username in activeUsers) {
      if (activeUsers[username] === socket.id) {
        delete activeUsers[username];
        io.emit("userListUpdate", Object.keys(activeUsers));
        break;
      }
    }
  });
});

// Start server
server.listen(PORT, () => {
  connectDB();
  console.log(`Server listening at port ${PORT}`);
});
