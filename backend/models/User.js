const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'client'], // The role can only be one of these values
    default: 'client',       // If not specified, the user is a client
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
