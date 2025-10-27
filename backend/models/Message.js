const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for storing project chat messages
const messageSchema = new Schema({
  project: { // Links the message to a specific Project (compartmentalizes chat)
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  sender: { // Links the message to the User who sent it (Admin or Client)
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: { // The actual text of the message
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// This registers the model with Mongoose
module.exports = mongoose.model('Message', messageSchema);
