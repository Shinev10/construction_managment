const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inquiryMessageSchema = new Schema({
  inquiry: {
    type: Schema.Types.ObjectId,
    ref: 'Inquiry',
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // sender can be null if it's an AI message
    default: null
  },
  senderType: {
    type: String,
    enum: ['user', 'ai', 'admin'],
    required: true
  },
  content: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('InquiryMessage', inquiryMessageSchema);