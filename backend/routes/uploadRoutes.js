const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create the uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save files to 'backend/uploads'
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB file size limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('chatImage'); // 'chatImage' must match the FormData key from the frontend

// @route   POST /api/upload/chat-image
// @desc    Upload an image for chat
// @access  Private (should be protected by auth)
const authMiddleware = require('../middleware/authMiddleware');

router.post('/chat-image', authMiddleware, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Upload Error:", err);
      return res.status(400).json({ msg: err.message || err });
    }
    if (req.file == null) {
      return res.status(400).json({ msg: 'No file selected' });
    }
    
    // File was uploaded successfully
    // Return the *relative* path to the file
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({
      msg: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  });
});

module.exports = router;
