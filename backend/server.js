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
// Ensure these files exist in backend/models/
const InquiryMessage = require('./models/InquiryMessage'); 
const Inquiry = require('./models/Inquiry');

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
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"], // Add your frontend URLs
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

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inquiries', inquiryRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running 👍');
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log(`✅ User Connected: ${socket.id}`);

  // --- Project chat rooms ---
  socket.on('join_project_room', (projectId) => {
    console.log(`[Socket ${socket.id}] User joining PROJECT room ${projectId}`);
    try {
      socket.join(projectId);
      console.log(`[Socket ${socket.id}] Joined PROJECT room ${projectId}`);
    } catch (err) {
      console.error(`[Socket ${socket.id}] Error joining project room:`, err);
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
      console.error(`[Socket ${socket.id}] Error sending project message:`, err);
    }
  });

  // --- Inquiry chat ---
  socket.on('join_inquiry_room', (inquiryId) => {
    console.log(`[Socket ${socket.id}] User joining INQUIRY room ${inquiryId}`);
    try {
      socket.join(inquiryId);
    } catch (err) {
      console.error(`[Socket ${socket.id}] Error joining inquiry room:`, err);
    }
  });

  socket.on('send_inquiry_message', async (data) => {
    const { inquiryId, senderId, content } = data;

    if (!mongoose.Types.ObjectId.isValid(inquiryId) || (senderId && !mongoose.Types.ObjectId.isValid(senderId))) {
      console.error(`[Socket ${socket.id}] Invalid IDs for send_inquiry_message`);
      return;
    }

    try {
      // Save user message
      const userMessage = new InquiryMessage({
        inquiry: inquiryId,
        sender: senderId,
        senderType: 'user', // Or 'admin' if senderId is an admin
        content,
      });
      await userMessage.save();
      
      const populatedUserMessage = await InquiryMessage.findById(userMessage._id).populate('sender', 'name role');
      io.to(inquiryId).emit('receive_inquiry_message', populatedUserMessage);

      // Update inquiry activity
      const inquiry = await Inquiry.findByIdAndUpdate(inquiryId, { updatedAt: Date.now() }, { new: true })
        .populate('client', 'name email')
        //.populate('assignedAdmin', 'name'); // Ensure this field exists in your Inquiry model

      if (!inquiry) return;
      
      // Notify admins about the update (optional, requires admin room logic)
      // io.to('admin_room').emit('inquiry_updated_realtime', inquiry); 

      // Trigger AI if chatState is 'ai' and user is client
      // We need to fetch the sender to check their role
      const senderUser = await User.findById(senderId);
      
      if (inquiry.chatState === 'ai' && senderUser && senderUser.role === 'client') {
        console.log(`[Socket ${socket.id}] Message from client in AI mode. Getting AI response...`);

        const aiResponseText = getCustomAIResponse(content); 
        
        const aiMessage = new InquiryMessage({
          inquiry: inquiryId,
          sender: null,
          senderType: 'ai',
          content: aiResponseText,
        });
        await aiMessage.save();

        io.to(inquiryId).emit('receive_inquiry_message', aiMessage);

        // Check for handoff trigger
        if (shouldHandoff(aiResponseText)) {
          console.log(`[Socket ${socket.id}] AI triggered handoff for inquiry ${inquiryId}`);
          inquiry.chatState = 'admin';
          await inquiry.save();

          const populatedHandoff = await Inquiry.findById(inquiry._id)
            .populate('client', 'name email')
            //.populate('assignedAdmin', 'name');
            
          io.to(inquiryId).emit('chat_taken_over', populatedHandoff);
        }
      }
    } catch (err) {
      console.error(`[Socket ${socket.id}] Error processing 'send_inquiry_message':`, err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ User Disconnected: ${socket.id}`);
  });

  socket.on('connect_error', (err) => {
    console.error(`[Socket ${socket.id}] Connection Error: ${err.message}`);
  });
});

// MongoDB connection
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