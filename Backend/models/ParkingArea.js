const mongoose = require('mongoose');

const parkingAreaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide parking area name'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Please provide location'],
    trim: true,
  },
  state: {
    type: String,
    trim: true,
    default: '',
  },
  totalSlots: {
    type: Number,
    required: [true, 'Please provide total number of slots'],
    min: 1,
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Please provide price per hour'],
    min: 0,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ParkingArea', parkingAreaSchema);
