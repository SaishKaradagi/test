// server.js
import express from "express";
import cors from "cors";
import { chatSession } from "./geminiHelp/genemini.js";
import dotenv from "dotenv";
import { analyzeResume } from "./geminiHelp/resumeAnalyzer.js";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import { Community } from "./models/Community.js";
import { Channel } from "./models/Channel.js";
import { Message } from "./models/Message.js";
import { communityController } from "./controllers/communityController.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(express.json());

// Track online users and their active rooms
const onlineUsers = new Map();
const userRooms = new Map();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user joining
  socket.on("user_join", (email) => {
    const username = email.split("@")[0];
    onlineUsers.set(socket.id, username);
    userRooms.set(socket.id, new Set());
    io.emit("user_list", Array.from(onlineUsers.values()));
    io.emit("chat_message", {
      type: "system",
      content: `${username} joined the chat`,
      timestamp: new Date(),
    });
  });

  // Join community and its channels
  socket.on("join_community", async ({ communityId }) => {
    try {
      const community = await Community.findById(communityId)
        .populate("channels")
        .exec();

      if (!community) {
        socket.emit("error", { message: "Community not found" });
        return;
      }

      // Join community room
      const communityRoom = `community:${communityId}`;
      socket.join(communityRoom);
      userRooms.get(socket.id).add(communityRoom);

      // Join all channels in the community
      for (const channel of community.channels) {
        const channelRoom = `channel:${channel._id}`;
        socket.join(channelRoom);
        userRooms.get(socket.id).add(channelRoom);
      }

      socket.emit("community_joined", {
        community: community,
        message: "Successfully joined community and channels",
      });
    } catch (error) {
      console.error("Error joining community:", error);
      socket.emit("error", { message: "Failed to join community" });
    }
  });

  // Join specific channel
  socket.on("join_channel", async ({ channelId }) => {
    try {
      const channel = await Channel.findById(channelId);
      if (!channel) {
        socket.emit("error", { message: "Channel not found" });
        return;
      }

      const channelRoom = `channel:${channelId}`;
      socket.join(channelRoom);
      userRooms.get(socket.id).add(channelRoom);

      // Get recent messages
      const recentMessages = await Message.find({ channel: channelId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("author", "username")
        .exec();

      socket.emit("channel_joined", {
        channel: channel,
        recentMessages: recentMessages,
      });
    } catch (error) {
      console.error("Error joining channel:", error);
      socket.emit("error", { message: "Failed to join channel" });
    }
  });

  // Send message in channel
  socket.on("send_channel_message", async ({ channelId, content }) => {
    try {
      const username = onlineUsers.get(socket.id);
      if (!username) {
        socket.emit("error", { message: "User not authenticated" });
        return;
      }

      const channel = await Channel.findById(channelId);
      if (!channel) {
        socket.emit("error", { message: "Channel not found" });
        return;
      }

      const message = new Message({
        content: content,
        author: username,
        channel: channelId,
        type: "user",
      });
      await message.save();

      // Emit to all users in the channel
      io.to(`channel:${channelId}`).emit("channel_message", {
        ...message.toObject(),
        author: { username: username },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Leave channel
  socket.on("leave_channel", ({ channelId }) => {
    const channelRoom = `channel:${channelId}`;
    socket.leave(channelRoom);
    userRooms.get(socket.id)?.delete(channelRoom);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const username = onlineUsers.get(socket.id);
    if (username) {
      // Leave all rooms
      const userRoomSet = userRooms.get(socket.id);
      if (userRoomSet) {
        for (const room of userRoomSet) {
          socket.leave(room);
        }
        userRooms.delete(socket.id);
      }

      onlineUsers.delete(socket.id);
      io.emit("user_list", Array.from(onlineUsers.values()));
      io.emit("chat_message", {
        type: "system",
        content: `${username} left the chat`,
        timestamp: new Date(),
      });
    }
  });
});

// MongoDB connection
try {
  await mongoose.connect(MONGO_URL, {
    ssl: true,
    sslValidate: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("MongoDB connection error:", error);
}

// REST API Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Community routes
app.get("/api/communities", communityController.getAllCommunities);
app.get("/api/communities/:id", communityController.getCommunity);
app.post("/api/communities", communityController.createCommunity);
app.post("/api/communities/:id/join", communityController.joinCommunity);
app.get(
  "/api/channels/:channelId/messages",
  communityController.getChannelMessages
);

// Roadmap Generation Route
app.use("/roadmap", async (req, res) => {
  try {
    const { field, months } = req.query;
    if (!field || !months) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const inputPrompt = `Generate a structured JSON roadmap for becoming a ${field} in ${months} months...`; // Your existing prompt
    const result = await chatSession.sendMessage(inputPrompt);
    let jsonText = result.response.text();
    if (jsonText.includes("```")) {
      jsonText = jsonText.replace(/```json|```/g, "").trim();
    }
    const parsedData = JSON.parse(jsonText);
    res.status(200).json(parsedData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Error in fetching data through AI" });
  }
});

// Resume Analysis Route
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText || !targetRole) {
      return res
        .status(400)
        .json({ error: "Resume text and target role are required" });
    }
    const analysis = await analyzeResume(resumeText, targetRole);
    res.json(analysis);
  } catch (error) {
    console.error("Resume analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze resume",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
