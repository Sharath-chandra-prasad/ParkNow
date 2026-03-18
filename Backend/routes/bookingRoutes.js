const express = require('express');
const sendEmail = require('../utils/sendEmail');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const ParkingArea = require('../models/ParkingArea');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Helper function to format date
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Helper function to format time
const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

// @route   POST /api/bookings
// @desc    Create a new booking / reserve a slot
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { parkingArea, parkingSlot, vehicleNumber, startTime, endTime } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    
    if (hours <= 0) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // --- ATOMIC CHECK & DOUBLE BOOKING PREVENTION ---
    // Here we use findOneAndUpdate to securely "claim" the slot in one operation.
    // It must either be purely 'available', OR it must be 'pending' but securely locked by THIS precise user.
    const now = new Date();
    
    const slot = await ParkingSlot.findOneAndUpdate(
      {
        _id: parkingSlot,
        $or: [
          { status: 'available' },
          { 
            status: 'pending', 
            lockedBy: req.user._id,
            lockedExpiresAt: { $gt: now } // Lock must still be active!
          }
        ]
      },
      { 
        status: 'reserved',
        lockedBy: null, // Clear the lock
        lockedExpiresAt: null
      },
      { new: true }
    );

    if (!slot) {
      return res.status(400).json({ message: 'Sorry! This slot was just booked by someone else or your 50-second timer expired.' });
    }
    // ------

    // Get price per hour from parking area
    const area = await ParkingArea.findById(parkingArea);
    if (!area) {
      return res.status(404).json({ message: 'Parking area not found' });
    }

    // Calculate total cost
    const totalCost = hours * area.pricePerHour;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      parkingArea,
      parkingSlot,
      vehicleNumber,
      startTime: start,
      endTime: end,
      totalCost,
      status: 'confirmed',
    });

    // Populate booking details for response and Email
    const populatedBooking = await Booking.findById(booking._id)
      .populate('parkingArea', 'name location')
      .populate('parkingSlot', 'slotNumber')
      .populate('user', 'name email');

    // Send Confirmation Email via Nodemailer
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Booking Confirmed! ✅</h2>
        <p>Your parking slot has been reserved successfully.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Reservation Details:</h3>
          <p><strong>Parking Area:</strong> ${populatedBooking.parkingArea.name}</p>
          <p><strong>Slot Number:</strong> S${populatedBooking.parkingSlot.slotNumber}</p>
          <p><strong>Vehicle Number:</strong> ${vehicleNumber}</p>
          <p><strong>Date:</strong> ${formatDate(start)}</p>
          <p><strong>Time:</strong> ${formatTime(start)} – ${formatTime(end)}</p>
          <p><strong>Total Cost:</strong> ₹${totalCost}</p>
        </div>
        
        <p>Please arrive within your reserved time.</p>
        <p>Thank you for choosing ParkNow!</p>
      </div>
    `;

    sendEmail({
      to: populatedBooking.user.email,
      subject: 'ParkNow - Booking Confirmed',
      html: emailBody
    })
    .then(success => {
      if(success) console.log('Confirmation Email sent successfully to', populatedBooking.user.email);
    })
    .catch(err => console.error('Failed to send confirmation Email:', err));

    res.status(201).json(populatedBooking);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/bookings/my
// @desc    Get logged-in user's bookings
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('parkingArea', 'name location pricePerHour')
      .populate('parkingSlot', 'slotNumber')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/bookings/stats
// @desc    Get booking statistics for admin dashboard
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    // Total revenue from confirmed and completed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalCost' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const totalParkingAreas = await ParkingArea.countDocuments();
    const totalSlots = await ParkingSlot.countDocuments();
    const availableSlots = await ParkingSlot.countDocuments({ status: 'available' });

    res.json({
      totalBookings,
      activeBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue,
      totalParkingAreas,
      totalSlots,
      availableSlots,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings (admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('parkingArea', 'name location')
      .populate('parkingSlot', 'slotNumber')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('parkingArea', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the booking owner or admin can cancel
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Free up the parking slot
    const slot = await ParkingSlot.findById(booking.parkingSlot);
    if (slot) {
      slot.status = 'available';
      slot.currentBooking = null;
      await slot.save();
    }

    // Send Cancellation Email
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <h2 style="color: #e53e3e;">Booking Cancelled</h2>
        <p>Dear Customer,</p>
        <p>Your parking slot booking at <strong>${booking.parkingArea.name}</strong> has been successfully cancelled.</p>
        <p>If this cancellation was made by mistake, you can visit the ParkNow website and book a slot again at your convenience.</p>
        <p>Thank you for using ParkNow.</p>
        <p>Best regards,<br><strong>ParkNow Team</strong></p>
      </div>
    `;

    sendEmail({
      to: booking.user.email,
      subject: 'ParkNow - Booking Cancellation',
      html: emailBody
    })
    .then(success => {
      if(success) console.log('Cancellation Email sent to', booking.user.email);
    })
    .catch(err => console.error('Failed to send cancellation Email:', err));

    const updatedBooking = await Booking.findById(booking._id)
      .populate('parkingArea', 'name location')
      .populate('parkingSlot', 'slotNumber');

    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
