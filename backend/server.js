const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes'); // New: Import userRoutes

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // New: Use userRoutes for /api/users endpoint

// Root test route
app.get('/', (req, res) => {
  res.send('Backend is running 👍');
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');

    // Start server only after DB connects
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
