const express = require('express');
const router = express.Router();
// Import booking controller functions for booking operations
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');
// Import authentication middleware to protect booking routes
const protect = require('../middleware/authMiddleware');


// Create Booking
router.post(
  '/',
  protect,
  createBooking
);


// Get All Bookings
router.get(
  '/',
  protect,
  getAllBookings
);


// Get Single Booking
router.get(
  '/:id',
  protect,
  getBookingById
);


// Update Booking Status
router.put(
  '/:bookingId',
  protect,
  updateBookingStatus
);


// Delete Booking
router.delete(
  '/:id',
  protect,
  deleteBooking
);


module.exports = router;