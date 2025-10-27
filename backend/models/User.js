const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Good practice
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    // --- EDITED: Added 'manager' ---
    enum: ['admin', 'manager', 'client'], 
    default: 'client', // New signups are clients by default
  },
}, {
  timestamps: true, 
});

module.exports = mongoose.model('User', userSchema);

