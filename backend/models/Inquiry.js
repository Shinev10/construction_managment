const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inquirySchema = new Schema({
  client: { // The user who submitted the inquiry
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  offeringType: { // e.g., "The Compact (2BHK Apartment)"
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['New', 'Viewed', 'Contacted', 'Project Created', 'Closed'],
    default: 'New',
  },
  
  // --- NEW FIELDS FOR AI/ADMIN CHAT ---
  chatState: {
    type: String,
    enum: ['ai', 'admin'],
    default: 'ai', // Start with AI
  },
  assignedAdmin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null, // No admin assigned initially
  },
  // --- END OF NEW FIELDS ---

  createdAt: { // Ensures the timestamp is always saved
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true, // Use timestamps to track last update (for sorting)
});

module.exports = mongoose.model('Inquiry', inquirySchema);

