const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http'); 
const { Server } = require("socket.io"); 

// Import models
const Message = require('./models/Message');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Create HTTP server FROM the Express app
const server = http.createServer(app); 

// Initialize Socket.IO server and attach it to the HTTP server
const io = new Server(server, { 
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"], 
    methods: ["GET", "POST"]
  }
});

// Middleware to make io accessible in routes
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

// Root test route
app.get('/', (req, res) => {
  res.send('Backend is running 👍');
});


// WebSocket connection logic
io.on('connection', (socket) => {
  console.log(`✅ User Connected: ${socket.id}`);

  socket.on('join_project_room', (projectId) => {
     console.log(`[Socket ${socket.id}] User attempting to join room ${projectId}`);
     try {
         socket.join(projectId); // Join the room
         console.log(`[Socket ${socket.id}] User successfully joined room ${projectId}`);
         // socket.emit('joined_room', { success: true, room: projectId }); // Optional confirmation
     } catch (joinError) {
          console.error(`[Socket ${socket.id}] Error joining room ${projectId}:`, joinError);
          // socket.emit('join_error', { success: false, room: projectId, error: joinError.message }); // Optional error feedback
     }
  });
  
  // --- EDITED: Added more logging to send_message ---
  socket.on('send_message', async (data) => {
    const { projectId, senderId, content } = data;
    console.log(`[Socket ${socket.id}] Received 'send_message' for project ${projectId}`); 
    try {
        console.log(` -> Data: Sender=${senderId}, Content="${content}"`);
        
        console.log(` -> Saving message to DB...`);
        const message = new Message({ project: projectId, sender: senderId, content });
        await message.save();
        console.log(` -> Message saved successfully (ID: ${message._id}).`);

        console.log(` -> Populating sender info...`);
        const fullMessage = await Message.findById(message._id).populate('sender', 'name'); 
        if (!fullMessage) {
            console.error(` -> Failed to find message ${message._id} after saving.`);
            throw new Error('Failed to retrieve message after saving');
        }
        console.log(` -> Sender info populated.`);

        console.log(` -> Broadcasting 'receive_message' to room ${projectId}...`);
        // The emit function itself doesn't require a callback for simple broadcasts
        io.to(projectId).emit('receive_message', fullMessage); 
        console.log(` -> Broadcast complete for room ${projectId}.`);

    } catch(err) {
        console.error(`[Socket ${socket.id}] Error processing 'send_message' for project ${projectId}:`, err);
        // Optionally emit an error back to the sender
        // socket.emit('message_error', { error: 'Failed to send message', details: err.message });
    }
  });
  
  socket.on('disconnect', () => {
     console.log(`❌ User Disconnected: ${socket.id}`);
  });
  
  // Optional: Listen for general connection errors
  socket.on('connect_error', (err) => {
     console.error(`[Socket ${socket.id}] Connection Error: ${err.message}`);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    
    // Start the server using server.listen
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => { 
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); 
  });

