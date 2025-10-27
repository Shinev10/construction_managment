const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// @route    GET /api/users/me
// ... (existing /me route code) ...
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route    GET /api/users/clients
// ... (existing /clients route code) ...
router.get('/clients', authMiddleware, async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser || (requestingUser.role !== 'admin' && requestingUser.role !== 'manager')) {
            return res.status(403).json({ msg: 'Access denied.' });
        }
        const clients = await User.find({ role: 'client' }).select('name email _id');
        res.json(clients);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- NEW ROUTE ---
// @route    GET /api/users/managers
// @desc     Get all users with the 'manager' role
// @access   Private (Admin only)
router.get('/managers', authMiddleware, async (req, res) => {
    try {
        // 1. Check if the requesting user is an Admin
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser || requestingUser.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }

        // 2. Fetch users with the 'manager' role
        const managers = await User.find({ role: 'manager' }).select('name _id'); // Only need name and ID

        res.json(managers);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;

