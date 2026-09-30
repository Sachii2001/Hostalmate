const mongoose = require('mongoose');
// Define the booking data structure and validation rules
const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 // Reference the room being booked
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  // Store the date when the booking was created
  bookingDate: {
    type: Date,
    default: Date.now
  },
   // Store the booking start date an end date
  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },
 // booking status to predefined values
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending'
  }

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);