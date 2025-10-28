const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require("socket.io");

// Import models
const Message = require('./models/Message'); // Existing project messages
const User = require('./models/User');
const DirectMessage = require('./models/DirectMessage'); // 1. IMPORT: For direct messages
const Conversation = require('./models/Conversation'); // 2. IMPORT: For tracking conversations

const app = express();

// Middleware
app.use(cors()); //
app.use(express.json()); //

// Create HTTP server FROM the Express app
const server = http.createServer(app); //

// Initialize Socket.IO server and attach it to the HTTP server
const io = new Server(server, { //
  cors: { //
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"], // Adjust origins as needed //
    methods: ["GET", "POST"] //
  }
});

// Middleware to make io accessible in routes
app.use((req, res, next) => { //
  req.io = io; //
  next(); //
});

// Routes
const authRoutes = require('./routes/auth'); //
const projectRoutes = require('./routes/projects'); //
const userRoutes = require('./routes/userRoutes'); //
const inquiryRoutes = require('./routes/inquiries'); //
const chatRoutes = require('./routes/chatRoutes'); // 3. IMPORT: New chat routes

app.use('/api/auth', authRoutes); //
app.use('/api/projects', projectRoutes); //
app.use('/api/users', userRoutes); //
app.use('/api/inquiries', inquiryRoutes); //
app.use('/api/chat', chatRoutes); // 4. USE: New chat routes

// Root test route
app.get('/', (req, res) => { //
  res.send('Backend is running 👍'); //
});


// WebSocket connection logic
io.on('connection', (socket) => { //
  console.log(`✅ User Connected: ${socket.id}`); //

  // --- For Project Chat ---
  socket.on('join_project_room', (projectId) => { //
     console.log(`[Socket ${socket.id}] User attempting to join PROJECT room ${projectId}`); //
     try {
         socket.join(projectId); // Join the room //
         console.log(`[Socket ${socket.id}] User successfully joined PROJECT room ${projectId}`); //
     } catch (joinError) {
          console.error(`[Socket ${socket.id}] Error joining PROJECT room ${projectId}:`, joinError); //
     }
  });

  socket.on('send_message', async (data) => { //
    // ... (keep existing project message handling code) ...
    const { projectId, senderId, content } = data; //
    console.log(`[Socket ${socket.id}] Received 'send_message' for project ${projectId}`); //
    try { //
        console.log(` -> Data: Sender=${senderId}, Content="${content}"`); //

        console.log(` -> Saving message to DB...`); //
        const message = new Message({ project: projectId, sender: senderId, content }); //
        await message.save(); //
        console.log(` -> Message saved successfully (ID: ${message._id}).`); //

        console.log(` -> Populating sender info...`); //
        const fullMessage = await Message.findById(message._id).populate('sender', 'name'); //
        if (!fullMessage) { //
            console.error(` -> Failed to find message ${message._id} after saving.`); //
            throw new Error('Failed to retrieve message after saving'); //
        } //
        console.log(` -> Sender info populated.`); //

        console.log(` -> Broadcasting 'receive_message' to room ${projectId}...`); //
        io.to(projectId).emit('receive_message', fullMessage); //
        console.log(` -> Broadcast complete for room ${projectId}.`); //

    } catch(err) { //
        console.error(`[Socket ${socket.id}] Error processing 'send_message' for project ${projectId}:`, err); //
    } //
  });

  // --- 5. ADDED: For Direct Chat (Admin <-> Client) ---
  socket.on('join_dm_room', (conversationId) => {
    console.log(`[Socket ${socket.id}] User joining DIRECT MESSAGE room ${conversationId}`);
    try {
      socket.join(conversationId);
      console.log(`[Socket ${socket.id}] User successfully joined DIRECT MESSAGE room ${conversationId}`);
    } catch (joinError) {
      console.error(`[Socket ${socket.id}] Error joining DIRECT MESSAGE room ${conversationId}:`, joinError);
    }
  });

  // --- 6. ADDED: Handle sending a direct message ---
  socket.on('send_dm', async (data) => {
    const { conversationId, senderId, content } = data;
    console.log(`[Socket ${socket.id}] Received 'send_dm' for conversation ${conversationId}`);
    try {
      if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(senderId)) {
          console.error(` -> Invalid ID format received. Convo: ${conversationId}, Sender: ${senderId}`);
          return; // Stop processing if IDs are invalid
      }
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
          console.error(` -> Invalid or empty message content received.`);
          return; // Stop processing if content is bad
      }

      console.log(` -> DM Data: Sender=${senderId}, Content="${content}"`);

      console.log(` -> Saving DM to DB...`);
      const message = new DirectMessage({
        conversation: conversationId,
        sender: senderId,
        content: content,
      });
      await message.save();
      console.log(` -> DM saved successfully (ID: ${message._id}).`);

      // Update conversation timestamp
      await Conversation.findByIdAndUpdate(conversationId, { updatedAt: Date.now() });
      console.log(` -> Conversation ${conversationId} timestamp updated.`);

      console.log(` -> Populating DM sender info...`);
      const fullMessage = await DirectMessage.findById(message._id)
                                    .populate('sender', 'name role'); // Populate relevant sender details
      if (!fullMessage) {
        console.error(` -> Failed to find DM ${message._id} after saving.`);
        throw new Error('Failed to retrieve direct message after saving');
      }
      console.log(` -> DM Sender info populated.`);

      console.log(` -> Broadcasting 'receive_dm' to room ${conversationId}...`);
      io.to(conversationId).emit('receive_dm', fullMessage);
      console.log(` -> DM Broadcast complete for room ${conversationId}.`);

    } catch(err) {
      console.error(`[Socket ${socket.id}] Error processing 'send_dm' for conversation ${conversationId}:`, err);
      // Maybe emit an error back to the sender?
      // socket.emit('dm_error', { error: 'Failed to send direct message', details: err.message });
    }
  });
  // --- End Direct Chat Additions ---

  socket.on('disconnect', () => { //
     console.log(`❌ User Disconnected: ${socket.id}`); //
  });

  socket.on('connect_error', (err) => { //
     console.error(`[Socket ${socket.id}] Connection Error: ${err.message}`); //
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI) //
  .then(() => { //
    console.log('✅ MongoDB connected successfully'); //

    // Start the server using server.listen
    const PORT = process.env.PORT || 5000; //
    server.listen(PORT, () => { //
      console.log(`🚀 Server running on port ${PORT}`); //
    });
  })
  .catch((err) => { //
    console.error('❌ MongoDB connection failed:', err.message); //
    process.exit(1); //
  });