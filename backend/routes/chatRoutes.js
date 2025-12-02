const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @route   POST api/chat/start
// @desc    Get or Create a conversation
router.post('/start', authMiddleware, async (req, res) => {
  try {
    // If Admin sends a specific 'userId', use that. Otherwise use the logged-in user's ID.
    let targetUserId = req.user.id;
    if (req.user.role === 'admin' && req.body.userId) {
        targetUserId = req.body.userId;
    }

    // 1. Find existing conversation for this target user
    let conversation = await Conversation.findOne({
      participants: { $in: [targetUserId] }
    }).populate('participants', 'name role email');

    // 2. If no conversation, create one
    if (!conversation) {
      // If the target is a client, we need to pair them with an admin (or the current admin)
      // If the requester is the client, pair with an admin.
      // If the requester is admin, pair with the target client.
      
      let participants = [targetUserId];
      
      // Ensure an admin is in the participants
      const admin = await User.findOne({ role: 'admin' });
      if (!admin) return res.status(404).json({ msg: 'No admins available' });
      
      if (targetUserId !== admin._id.toString()) {
          participants.push(admin._id);
      }

      conversation = new Conversation({
        participants: [...new Set(participants)], // Remove duplicates
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

module.exports = router;