const express = require('express');
const ParkingArea = require('../models/ParkingArea');
const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/parking-areas
// @desc    Get all parking areas with available slot counts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const parkingAreas = await ParkingArea.find().sort({ createdAt: -1 });

    // Get available slot count for each area
    const areasWithSlots = await Promise.all(
      parkingAreas.map(async (area) => {
        const availableSlots = await ParkingSlot.countDocuments({
          parkingArea: area._id,
          status: 'available',
        });
        const totalSlotsInDb = await ParkingSlot.countDocuments({
          parkingArea: area._id,
        });
        return {
          ...area.toObject(),
          availableSlots,
          totalSlotsInDb,
        };
      })
    );

    res.json(areasWithSlots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/parking-areas/:id
// @desc    Get single parking area
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const area = await ParkingArea.findById(req.params.id);
    if (!area) {
      return res.status(404).json({ message: 'Parking area not found' });
    }
    res.json(area);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/parking-areas
// @desc    Create a new parking area + auto-generate slots
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, location, totalSlots, pricePerHour, description } = req.body;

    const parkingArea = await ParkingArea.create({
      name,
      location,
      totalSlots,
      pricePerHour,
      description,
    });

    // Auto-generate parking slots
    const slots = [];
    for (let i = 1; i <= totalSlots; i++) {
      slots.push({
        parkingArea: parkingArea._id,
        slotNumber: i,
        status: 'available',
      });
    }
    await ParkingSlot.insertMany(slots);

    res.status(201).json(parkingArea);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/parking-areas/:id
// @desc    Update parking area
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, location, totalSlots, pricePerHour, description } = req.body;

    const parkingArea = await ParkingArea.findById(req.params.id);
    if (!parkingArea) {
      return res.status(404).json({ message: 'Parking area not found' });
    }

    // If totalSlots changed, update slots
    const oldTotalSlots = parkingArea.totalSlots;

    parkingArea.name = name || parkingArea.name;
    parkingArea.location = location || parkingArea.location;
    parkingArea.totalSlots = totalSlots || parkingArea.totalSlots;
    parkingArea.pricePerHour = pricePerHour !== undefined ? pricePerHour : parkingArea.pricePerHour;
    parkingArea.description = description !== undefined ? description : parkingArea.description;

    await parkingArea.save();

    // If total slots increased, add new slots
    if (totalSlots && totalSlots > oldTotalSlots) {
      const newSlots = [];
      for (let i = oldTotalSlots + 1; i <= totalSlots; i++) {
        newSlots.push({
          parkingArea: parkingArea._id,
          slotNumber: i,
          status: 'available',
        });
      }
      await ParkingSlot.insertMany(newSlots);
    }

    res.json(parkingArea);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/parking-areas/:id
// @desc    Delete parking area and its slots
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const parkingArea = await ParkingArea.findById(req.params.id);
    if (!parkingArea) {
      return res.status(404).json({ message: 'Parking area not found' });
    }

    // Delete all slots for this area
    await ParkingSlot.deleteMany({ parkingArea: req.params.id });

    // Cancel all active bookings for this area
    await Booking.updateMany(
      { parkingArea: req.params.id, status: 'confirmed' },
      { status: 'cancelled' }
    );

    await ParkingArea.findByIdAndDelete(req.params.id);

    res.json({ message: 'Parking area deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
