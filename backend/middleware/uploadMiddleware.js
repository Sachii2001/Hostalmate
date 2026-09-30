const multer = require('multer');
const path = require('path');

// Configure file storage destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
   // Generate a unique filename
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
// Create the upload middleware using the configured storage
const upload = multer({ storage: storage });
module.exports = upload;