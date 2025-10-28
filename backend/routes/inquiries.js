const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Inquiry = require('../models/Inquiry'); // Import the Inquiry model defined elsewhere
const User = require('../models/User'); // Import User model to check roles and populate data

// @route   POST /api/inquiries
// @desc    Submit a new client inquiry
// @access  Private (Client only, technically any logged-in user can, but UI restricts)
router.post('/', authMiddleware, async (req, res) => {
  const { offeringType } = req.body;
  const clientId = req.user.id; // Get client ID from the authenticated token

  if (!offeringType) {
    return res.status(400).json({ msg: 'Offering type is required.' });
  }

  try {
    // Optional: Check if the user is actually a client
    const clientUser = await User.findById(clientId);
    if (!clientUser /* || clientUser.role !== 'client' */) { // You could enforce client role here if needed
        return res.status(404).json({ msg: 'User not found or invalid role.' });
    }

    // Create new inquiry instance
    const newInquiry = new Inquiry({
      client: clientId,
      offeringType: offeringType,
      status: 'New', // Default status
      // createdAt is handled by default: Date.now in the model
    });

    // Save the inquiry to the database
    const savedInquiry = await newInquiry.save();

    // Populate client info for potential real-time update
    const populatedInquiry = await Inquiry.findById(savedInquiry._id).populate('client', 'name email');

    // Emit a socket event to notify admins (if req.io is attached)
    if (req.io) {
      req.io.emit('new_inquiry', populatedInquiry);
      console.log("Emitted new_inquiry event");
    } else {
        console.warn("Socket.io (req.io) not available on request object. Cannot emit 'new_inquiry'.");
    }

    // Send success response back to the client
    res.status(201).json({ msg: 'Inquiry submitted successfully!', inquiry: populatedInquiry });

  } catch (err) {
    console.error("Error submitting inquiry:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/inquiries
// @desc    Get all inquiries (for Admin)
// @access  Private (Admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        // 1. Verify user is an admin
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }

        // 2. Fetch all inquiries, populate client details, sort by newest first
        const inquiries = await Inquiry.find()
            .populate('client', 'name email') // Get name and email of the client
            .sort({ createdAt: -1 }); // Show newest inquiries first

        res.json(inquiries);

    } catch (err) {
        console.error("Error fetching inquiries:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/inquiries/:inquiryId/status
// @desc    Update the status of an inquiry
// @access  Private (Admin only)
router.put('/:inquiryId/status', authMiddleware, async (req, res) => {
    const { status } = req.body;
    const { inquiryId } = req.params;

    // Basic validation
    const allowedStatuses = ['New', 'Viewed', 'Contacted', 'Project Created'];
    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ msg: 'Invalid or missing status provided.' });
    }
    if (!mongoose.Types.ObjectId.isValid(inquiryId)) {
        return res.status(400).json({ msg: 'Invalid Inquiry ID format.' });
    }

    try {
        // 1. Verify user is an admin
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }

        // 2. Find the inquiry
        const inquiry = await Inquiry.findById(inquiryId);
        if (!inquiry) {
            return res.status(404).json({ msg: 'Inquiry not found.' });
        }

        // 3. Update the status
        inquiry.status = status;
        const updatedInquiry = await inquiry.save();

        // Populate for socket emission
         const populatedInquiry = await Inquiry.findById(updatedInquiry._id).populate('client', 'name email');


        // Emit event to potentially update UI elsewhere (optional)
        if (req.io) {
            req.io.emit('inquiry_updated', populatedInquiry);
            console.log(`Emitted inquiry_updated event for ${inquiryId}`);
        }

        res.json(populatedInquiry);

    } catch (err) {
        console.error("Error updating inquiry status:", err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
