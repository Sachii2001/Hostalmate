const express = require('express');
const router = express.Router();
// Import room controller functions for room management operations
const {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
// Import middleware for image uploads and user authentication
const upload = require('../middleware/uploadMiddleware');
const protect = require('../middleware/authMiddleware');


// Create Room
router.post(
  '/',
  protect,
  upload.single('image'),
  createRoom
);


// Get All Rooms
router.get(
  '/',
  protect,
  getAllRooms
);


// Get Single Room
router.get(
  '/:id',
  protect,
  getRoomById
);


// Update Room
router.put(
  '/:id',
  protect,
  upload.single('image'),
  updateRoom
);


// Delete Room
router.delete(
  '/:id',
  protect,
  deleteRoom
);


module.exports = router;