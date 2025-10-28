const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Defines the schema for a single direct message
const directMessageSchema = new Schema({
  conversation: { // Links to the Conversation
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: { // The User who sent it
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: { // The text of the message
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt
});

module.exports = mongoose.model('DirectMessage', directMessageSchema);