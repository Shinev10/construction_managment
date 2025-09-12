const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Import the middleware
const User = require('../models/User');

// @route    GET /api/users/me
// @desc     Get current user's profile
// @access   Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;