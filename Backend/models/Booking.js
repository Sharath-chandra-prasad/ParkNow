const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parkingArea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingArea',
    required: true,
  },
  parkingSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please provide vehicle number'],
    trim: true,
    uppercase: true,
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide start time'],
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide end time'],
  },
  totalCost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
