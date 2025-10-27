const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register user
router.post('/register', async (req, res) => {
  // Allow role specification during registration (optional, defaults to client)
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }

  // Validate role if provided - uses the updated enum from User.js
  const allowedRoles = ['admin', 'manager', 'client'];
  const userRole = (role && allowedRoles.includes(role)) ? role : 'client'; // Default to client

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole, // Assign the role based on input or default
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // --- EDITED: Ensure role is included in the payload ---
    // This payload now includes the user's specific role from the database
    const payload = {
      user: {
        id: user.id,
        name: user.name, // Include name
        role: user.role  // Include the role ('admin', 'manager', or 'client')
      },
    };

    // Sign the token
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1d' } // Token expires in 1 day
    );

    res.json({ token }); // Send the token back

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;

