const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
// 1. IMPORT THE DIRECT MESSAGE MODEL
const DirectMessage = require('../models/DirectMessage'); 

// @route   POST api/chat/start
// @desc    Get or Create a conversation
router.post('/start', authMiddleware, async (req, res) => {
  try {
    let targetUserId = req.user.id;
    if (req.user.role === 'admin' && req.body.userId) {
        targetUserId = req.body.userId;
    }

    let conversation = await Conversation.findOne({
      participants: { $in: [targetUserId] }
    }).populate('participants', 'name role email');

    if (!conversation) {
      let participants = [targetUserId];
      const admin = await User.findOne({ role: 'admin' });
      if (!admin) return res.status(404).json({ msg: 'No admins available' });
      
      if (targetUserId !== admin._id.toString()) {
          participants.push(admin._id);
      }

      conversation = new Conversation({
        participants: [...new Set(participants)],
        lastMessage: 'Chat started',
      });
      await conversation.save();
      conversation = await conversation.populate('participants', 'name role email');
    }

    res.json(conversation);
  } catch (err) {
    console.error("Chat Start Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/chat/conversations
// @desc    Get all conversations
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user.id] }
    })
    .populate('participants', 'name role email')
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 2. ADD THIS ROUTE TO FETCH HISTORY
// @route   GET api/chat/:conversationId/messages
// @desc    Get chat history for a specific conversation
router.get('/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await DirectMessage.find({ 
      conversation: req.params.conversationId 
    })
    .populate('sender', 'name email role') 
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch History Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;