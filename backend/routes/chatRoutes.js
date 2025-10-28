const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Conversation = require('../models/Conversation');
const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User'); // We need User to populate names

// @route   POST /api/chat/conversation
// @desc    Get or create a conversation with a recipient
// @access  Private
router.post('/conversation', authMiddleware, async (req, res) => {
  const { recipientId } = req.body;
  const userId = req.user.id;

  if (!recipientId) {
    return res.status(400).json({ msg: 'Recipient ID is required' });
  }

  try {
    // Find a conversation that includes BOTH the current user and the recipient
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
    });

    // If no conversation exists, create one
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, recipientId],
      });
      await conversation.save();
    }

    // Populate participant info
    const populatedConversation = await Conversation.findById(conversation._id)
                                    .populate('participants', 'name email role');

    res.json(populatedConversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/chat/conversation/:conversationId/messages
// @desc    Get all messages for a specific conversation
// @access  Private
router.get('/conversation/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await DirectMessage.find({
      conversation: req.params.conversationId,
    })
    .populate('sender', 'name role') // Populate sender's name and role
    .sort({ createdAt: 'asc' }); // Get messages in chronological order

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/chat/conversations
// @desc    Get all conversations for the logged-in user
// @access  Private
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.id
        })
        .populate('participants', 'name email role') // Get info about who is in the chat
        .sort({ updatedAt: 'desc' }); // Show most recent chats first

        res.json(conversations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;