const express = require('express');
const sendEmail = require('../utils/sendEmail');
const ParkingSlot = require('../models/ParkingSlot');
const { protect } = require('../middleware/auth');

const router = express.Router();

// In-memory OTP store (for production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/otp/send
// @desc    Send OTP to email (and potentially lock a slot)
// @access  Public (Optional auth if locking slot)
router.post('/send', async (req, res, next) => {
  try {
    const { email, slotId, userId } = req.body; // Accept slotId for locking

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Only @gmail.com email addresses are allowed' });
    }

    // Step 1: Handle 50-second Temporary Lock if slotId is provided
    if (slotId && userId) {
      const slot = await ParkingSlot.findById(slotId);
      if (!slot) return res.status(404).json({ message: 'Slot not found' });

      // If already booked, or if it's currently locked by someone else
      if (slot.status === 'occupied' || slot.status === 'reserved') {
        return res.status(400).json({ message: 'Slot is no longer available' });
      }

      const now = new Date();
      if (slot.status === 'pending' && slot.lockedExpiresAt > now && slot.lockedBy.toString() !== userId) {
        return res.status(400).json({ message: 'Someone else is currently booking this slot. Try again in 50 seconds.' });
      }

      // Lock the slot for exactly 50 seconds!
      slot.status = 'pending';
      slot.lockedBy = userId;
      slot.lockedExpiresAt = new Date(Date.now() + 50 * 1000); // 50 seconds from now
      await slot.save();
    }

    const otp = generateOTP();

    // Store OTP with 5-minute expiry, keyed by email
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Send OTP via Email
    const message = `
      <h2>ParkNow Verification Code</h2>
      <p>Your authentication code is: <strong>${otp}</strong></p>
      <p>This code is valid for 5 minutes.</p>
      <p>If you did not request this code, please ignore this email.</p>
    `;

    const emailSent = await sendEmail({
      to: email,
      subject: 'ParkNow - Your Verification Code',
      html: message,
    });

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP sent successfully to email' });
  } catch (error) {
    console.error('OTP error:', error.message);
    next(error);
  }
});

// @route   POST /api/otp/verify
// @desc    Verify OTP code
// @access  Public
router.post('/verify', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const stored = otpStore.get(email);

    if (!stored) {
      return res.status(400).json({ message: 'No OTP found for this email. Please request a new one.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP verified - clean up
    otpStore.delete(email);

    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
