const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Defines a chat conversation between two or more users
const conversationSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
}, {
  timestamps: true, // Adds createdAt/updatedAt
});

module.exports = mongoose.model('Conversation', conversationSchema);