const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the structure of a Project document
const projectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from both ends of a string
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'], // Only allows these values
    default: 'Not Started',
  },
  manager: {
    type: Schema.Types.ObjectId, // This is a special type for IDs
    ref: 'User', // This creates a link to the 'User' model
    required: true,
  },
  team: [{
    type: Schema.Types.ObjectId,
    ref: 'User', // An array of links to users on the project team
  }],
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Project', projectSchema);
