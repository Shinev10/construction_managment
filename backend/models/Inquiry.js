const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inquirySchema = new Schema({
  client: { // The user who submitted the inquiry
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  offeringType: { // e.g., "₹50 Lakh Range"
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['New', 'Viewed', 'Contacted', 'Project Created'],
    default: 'New',
  },
  conversationId: { // Link to the chat conversation
    type: String, 
    required: false,
    default: null,
  },
  createdAt: { // Ensures the timestamp is always saved
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: false, // Set to false since we define createdAt manually
});

// --- CRITICAL FIX: The Model MUST be registered and exported correctly ---
// This line creates the 'Inquiry' model from the schema.
module.exports = mongoose.model('Inquiry', inquirySchema);
