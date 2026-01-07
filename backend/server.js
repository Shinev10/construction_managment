const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const fs = require('fs');

// Import models
const Message = require('./models/Message');
const User = require('./models/User');
const InquiryMessage = require('./models/InquiryMessage'); 
const Inquiry = require('./models/Inquiry');
// --- 1. ADDED: Models for Direct Messaging ---
const DirectMessage = require('./models/DirectMessage'); 
const Conversation = require('./models/Conversation');

// Ensure aiResponder exists in backend/ai/
const { getCustomAIResponse, shouldHandoff } = require('./ai/aiResponder');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"], 
    methods: ["GET", "POST"]
  }
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const userRoutes = require('./routes/userRoutes');
const inquiryRoutes = require('./routes/inquiries');
// --- 2. ADDED: Import Chat Routes ---
const chatRoutes = require('./routes/chatRoutes'); 

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inquiries', inquiryRoutes);
// --- 3. ADDED: Use Chat Routes ---
app.use('/api/chat', chatRoutes); 

app.get('/', (req, res) => {
  res.send('Backend is running 👍');
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log(`✅ User Connected: ${socket.id}`);

  // --- Project chat rooms ---
  socket.on('join_project_room', (projectId) => {
    try {
      socket.join(projectId);
      console.log(`[Socket ${socket.id}] Joined PROJECT room ${projectId}`);
    } catch (err) {
      console.error(`[Socket] Error joining project room:`, err);
    }
  });

  socket.on('send_message', async (data) => {
    const { projectId, senderId, content } = data;
    try {
      const message = new Message({ project: projectId, sender: senderId, content });
      await message.save();
      const fullMessage = await Message.findById(message._id).populate('sender', 'name');
      io.to(projectId).emit('receive_message', fullMessage);
    } catch (err) {
      console.error(`[Socket] Error sending project message:`, err);
    }
  });

  // --- Inquiry chat ---
  socket.on('join_inquiry_room', (inquiryId) => {
    try {
      socket.join(inquiryId);
    } catch (err) {
      console.error(`[Socket] Error joining inquiry room:`, err);
    }
  });

  socket.on('send_inquiry_message', async (data) => {
    const { inquiryId, senderId, content } = data;

    if (!mongoose.Types.ObjectId.isValid(inquiryId) || (senderId && !mongoose.Types.ObjectId.isValid(senderId))) {
      return;
    }

    try {
      const userMessage = new InquiryMessage({
        inquiry: inquiryId,
        sender: senderId,
        senderType: 'user', 
        content,
      });
      await userMessage.save();
      
      const populatedUserMessage = await InquiryMessage.findById(userMessage._id).populate('sender', 'name role');
      io.to(inquiryId).emit('receive_inquiry_message', populatedUserMessage);

      const inquiry = await Inquiry.findByIdAndUpdate(inquiryId, { updatedAt: Date.now() }, { new: true })
        .populate('client', 'name email');

      if (!inquiry) return;
      
      const senderUser = await User.findById(senderId);
      
      if (inquiry.chatState === 'ai' && senderUser && senderUser.role === 'client') {
        const aiResponseText = getCustomAIResponse(content); 
        
        const aiMessage = new InquiryMessage({
          inquiry: inquiryId,
          sender: null,
          senderType: 'ai',
          content: aiResponseText,
        });
        await aiMessage.save();

        io.to(inquiryId).emit('receive_inquiry_message', aiMessage);

        if (shouldHandoff(aiResponseText)) {
          inquiry.chatState = 'admin';
          await inquiry.save();

          const populatedHandoff = await Inquiry.findById(inquiry._id)
            .populate('client', 'name email');
            
          io.to(inquiryId).emit('chat_taken_over', populatedHandoff);
        }
      }
    } catch (err) {
      console.error(`[Socket] Error processing inquiry message:`, err);
    }
  });

  // --- 4. ADDED: Direct Message (DM) Logic ---
  // This was missing, causing messages not to appear for the other user!
  socket.on('join_dm_room', (conversationId) => {
    console.log(`[Socket ${socket.id}] Joining DM room ${conversationId}`);
    socket.join(conversationId);
  });

  socket.on('send_dm', async (data) => {
    const { conversationId, senderId, content } = data;
    try {
      // 1. Save Message to DB
      const newMessage = new DirectMessage({
        conversation: conversationId,
        sender: senderId,
        content: content
      });
      await newMessage.save();

      // 2. Populate sender info for the UI
      const populatedMessage = await DirectMessage.findById(newMessage._id)
        .populate('sender', 'name email');

      // 3. Update Conversation "last message"
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: content,
        lastMessageAt: Date.now()
      });

      // 4. Broadcast to room (Client & Admin see this)
      io.to(conversationId).emit('receive_dm', populatedMessage);
      
    } catch (err) {
      console.error(`[Socket] Error sending DM:`, err);
    }
  });
  // -------------------------------------------

  socket.on('disconnect', () => {
    console.log(`❌ User Disconnected: ${socket.id}`);
  });

  socket.on('connect_error', (err) => {
    console.error(`[Socket] Connection Error: ${err.message}`);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });