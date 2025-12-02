const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Inquiry = require('../models/Inquiry');
const InquiryMessage = require('../models/InquiryMessage');
const User = require('../models/User');
const { getCustomAIResponse } = require('../ai/aiResponder');

// =============================================
// POST /api/inquiries
// Submit a new client inquiry
// =============================================
router.post('/', authMiddleware, async (req, res) => {
  const { offeringType } = req.body;
  const clientId = req.user.id;

  if (!offeringType) {
    return res.status(400).json({ msg: 'Offering type is required.' });
  }

  try {
    const newInquiry = new Inquiry({
      client: clientId,
      offeringType,
      status: 'New',
      chatState: 'ai',
    });

    const savedInquiry = await newInquiry.save();

    // Auto AI reply
    const aiResponseText = getCustomAIResponse(offeringType);

    const aiMessage = new InquiryMessage({
      inquiry: savedInquiry._id,
      sender: null,
      senderType: 'ai',
      content: aiResponseText,
    });

    await aiMessage.save();

    const populatedInquiry = await Inquiry.findById(savedInquiry._id)
      .populate('client', 'name email');

    if (req.io) req.io.emit('new_inquiry', populatedInquiry);

    res.status(201).json({
      msg: 'Inquiry submitted successfully.',
      inquiry: populatedInquiry,
    });

  } catch (err) {
    console.error('Error submitting inquiry:', err.message);
    res.status(500).send('Server Error');
  }
});

// =============================================
// GET /api/inquiries
// Admin → gets ALL inquiries
// Normal user → gets ONLY their inquiries
// =============================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const inquiries = await Inquiry.find()
        .populate('client', 'name email')
        .sort({ updatedAt: -1 });

      return res.json(inquiries);
    }

    // Normal user
    const inquiries = await Inquiry.find({ client: req.user.id })
      .populate('client', 'name email')
      .sort({ updatedAt: -1 });

    res.json(inquiries);

  } catch (err) {
    console.error('Error fetching inquiries:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// =============================================
// PUT /api/inquiries/:id/status
// Admin changes inquiry status
// =============================================
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ msg: 'Inquiry not found' });

    inquiry.status = req.body.status;
    inquiry.updatedAt = Date.now();

    await inquiry.save();

    // <-- FIXED LINE: use findById to fetch populated result
    const updatedInquiry = await Inquiry.findById(req.params.id)
      .populate('client', 'name email');

    if (req.io) req.io.emit('inquiry_updated', updatedInquiry);

    res.json(updatedInquiry);

  } catch (err) {
    console.error('Update status error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// =============================================
// PUT /api/inquiries/:id/takeover
// Admin takes over the chat from AI
// =============================================
router.put('/:id/takeover', authMiddleware, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ msg: 'Inquiry not found' });

    inquiry.chatState = 'admin';
    inquiry.updatedAt = Date.now();

    await inquiry.save();

    const updatedInquiry = await Inquiry.findById(req.params.id)
      .populate('client', 'name email');

    if (req.io) req.io.emit('chat_taken_over', updatedInquiry);

    res.json(updatedInquiry);

  } catch (err) {
    console.error('Error taking over chat:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// =============================================
// GET /api/inquiries/:id/messages
// Get all messages for a specific inquiry
// =============================================
router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await InquiryMessage.find({ inquiry: req.params.id })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
