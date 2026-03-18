const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  parkingArea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingArea',
    required: true,
  },
  slotNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'reserved', 'occupied'],
    default: 'available',
  },
  lockedExpiresAt: {
    type: Date,
    default: null,
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  currentBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },
});

// Compound index to ensure unique slot numbers within a parking area
parkingSlotSchema.index({ parkingArea: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
