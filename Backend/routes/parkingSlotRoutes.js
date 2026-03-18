const express = require('express');
const ParkingSlot = require('../models/ParkingSlot');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/parking-slots/:areaId
// @desc    Get all slots for a parking area
// @access  Public
router.get('/:areaId', async (req, res, next) => {
  try {
    const slots = await ParkingSlot.find({ parkingArea: req.params.areaId })
      .populate('currentBooking')
      .sort({ slotNumber: 1 });

    // Auto-release expired locks (50 seconds)
    const now = new Date();
    let updated = false;

    for (let slot of slots) {
      if (slot.status === 'pending' && slot.lockedExpiresAt && slot.lockedExpiresAt < now) {
        slot.status = 'available';
        slot.lockedExpiresAt = null;
        slot.lockedBy = null;
        await slot.save();
        updated = true;
      }
    }

    // Refetch if we unlocked anything to send fresh data
    const finalSlots = updated 
      ? await ParkingSlot.find({ parkingArea: req.params.areaId }).populate('currentBooking').sort({ slotNumber: 1 })
      : slots;

    res.json(finalSlots);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/parking-slots/:id/status
// @desc    Update slot status (admin)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    slot.status = status;
    if (status === 'available') {
      slot.currentBooking = null;
    }
    await slot.save();

    res.json(slot);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
