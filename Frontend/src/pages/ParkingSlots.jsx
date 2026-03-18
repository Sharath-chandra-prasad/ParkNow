import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCar, FaMapMarkerAlt, FaTimes, FaRupeeSign, FaShieldAlt, FaClock } from 'react-icons/fa';
import PremiumTimePicker from '../components/PremiumTimePicker';

const ParkingSlots = () => {
  const { areaId } = useParams();
  const { API_URL, user } = useAuth();
  const navigate = useNavigate();
  const [area, setArea] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // States for booking and OTP flow
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
  const [otp, setOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Helper to get formatted local time
  const getInitialTime = (offsetHours = 0) => {
    const d = new Date();
    d.setHours(d.getHours() + offsetHours);
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5); // Round to nearest 5 mins
    d.setSeconds(0, 0);
    return d.toISOString();
  };

  const [bookingData, setBookingData] = useState({
    vehicleNumber: '',
    startTime: getInitialTime(0),
    endTime: getInitialTime(1),
  });

  useEffect(() => {
    fetchData();

    // Poll for slot updates every 5 seconds so users see locks appearing/disappearing
    const intervalId = setInterval(() => {
      fetchData(false); // Silent fetch, no global loading spinner
    }, 5000);

    return () => clearInterval(intervalId);
  }, [areaId]);

  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const [areaRes, slotsRes] = await Promise.all([
        axios.get(`${API_URL}/parking-areas/${areaId}`),
        axios.get(`${API_URL}/parking-slots/${areaId}`),
      ]);
      setArea(areaRes.data);
      setSlots(slotsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading parking data');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleSlotClick = (slot) => {
    if (slot.status === 'occupied' || slot.status === 'reserved') return;
    if (slot.status === 'pending' && slot.lockedBy !== user?._id) {
       toast.warning('Someone else is currently booking this slot.');
       return;
    }
    setSelectedSlot(slot);
    setBookingData(prev => ({
      ...prev,
      startTime: getInitialTime(0),
      endTime: getInitialTime(1)
    }));
    setStep(1); // Reset to step 1
    setShowModal(true);
  };

  const calculateCost = () => {
    if (!bookingData.startTime || !bookingData.endTime || !area) return 0;
    const start = new Date(bookingData.startTime);
    const end = new Date(bookingData.endTime);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    return hours > 0 ? hours * area.pricePerHour : 0;
  };

  // Step 1: Send OTP for verification
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!bookingData.vehicleNumber || !bookingData.startTime || !bookingData.endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    const start = new Date(bookingData.startTime);
    const end = new Date(bookingData.endTime);
    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }

    if (!user || !user.email) { // Changed from user.phone to user.email
      toast.error('User email missing. Please check your profile.');
      return;
    }

    setOtpSending(true);
    try {
      if (!selectedSlot) throw new Error('No slot selected');
      
      // Send slotId and userId to initiate the 50-second lock!
      await axios.post(`${API_URL}/otp/send`, { 
        email: user?.email,
        slotId: selectedSlot._id,
        userId: user?._id
      });
      
      // Update UI state FIRST
      setStep(2); 
      setSlots(prev => prev.map(s => s._id === selectedSlot._id ? { ...s, status: 'pending', lockedBy: user?._id } : s));
      
      // Toast LAST - only if everything above succeeded
      toast.success('Slot secured! OTP sent to your email.'); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  // Step 2: Verify OTP and proceed to book
  const handleVerifyAndBook = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setBookingLoading(true);
    try {
      // First, verify OTP
      const verifyRes = await axios.post(`${API_URL}/otp/verify`, { email: user?.email, otp }); // Changed from user.phone to user.email
      
      if (verifyRes.data.verified) {
        // Validation passed, create the booking
        await axios.post(`${API_URL}/bookings`, { // Corrected syntax here
          parkingArea: areaId,
          parkingSlot: selectedSlot._id,
          vehicleNumber: bookingData.vehicleNumber,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
        });

        toast.success('Booking confirmed successfully!');
        setShowModal(false);
        setSelectedSlot(null);
        setBookingData({ vehicleNumber: '', startTime: '', endTime: '' });
        setOtp('');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="page-container theme-slots">
      <div className="page-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/parking-areas')}>
          ← Back to Areas
        </button>
        <h1>{area?.name || 'Parking Area'}</h1>
        <p><FaMapMarkerAlt /> {area?.location} &nbsp;|&nbsp; ₹{area?.pricePerHour}/hour</p>
      </div>

      {/* Slot Legend */}
      <div className="slot-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color reserved"></div>
          <span>Reserved</span>
        </div>
        <div className="legend-item">
          <div className="legend-color occupied"></div>
          <span>Occupied</span>
        </div>
      </div>

      <div className="slots-grid">
        {slots.map((slot) => {
          // If it is pending but locked by the current user, color it differently
          const isMyLock = slot.status === 'pending' && slot.lockedBy === user?._id;
          const statusClass = isMyLock ? 'available' : slot.status; // Treat our own lock as green for ourselves
          
          return (
            <div
              key={slot._id}
              className={`slot-card slot-${statusClass} ${selectedSlot?._id === slot._id ? 'selected' : ''}`}
              onClick={() => handleSlotClick(slot)}
            >
              <FaCar className="slot-icon" />
              <span className="slot-number">S{slot.slotNumber}</span>
              <span className="slot-status-text">{slot.status === 'pending' ? (isMyLock ? 'Your Selection' : 'Occupied') : slot.status}</span>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reserve Parking Slot</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              {step === 1 ? (
                /* Step 1: Details Form */
                <>
                  <div className="booking-summary">
                    <p><strong>Area:</strong> {area?.name}</p>
                    <p><strong>Location:</strong> {area?.location}</p>
                    <p><strong>Slot:</strong> S{selectedSlot?.slotNumber}</p>
                    <p><strong>Rate:</strong> ₹{area?.pricePerHour}/hour</p>
                  </div>
                  <form onSubmit={handleSendOTP}>
                    <div className="form-group">
                      <label htmlFor="vehicleNumber">Vehicle Number</label>
                      <input
                        type="text"
                        id="vehicleNumber"
                        value={bookingData.vehicleNumber}
                        onChange={(e) => setBookingData({ ...bookingData, vehicleNumber: e.target.value })}
                        placeholder="e.g., KA01AB1234"
                        required
                      />
                    </div>
                    
                    <div className="time-selection-section">
                      <div className="section-header start-theme">
                        <FaClock className="header-icon" /> <span>START TIME</span>
                      </div>
                      <PremiumTimePicker 
                        label="Enter Arrival Time"
                        value={bookingData.startTime}
                        onChange={(val) => setBookingData({ ...bookingData, startTime: val })}
                      />
                    </div>

                    <div className="time-selection-section">
                      <div className="section-header end-theme">
                        <FaClock className="header-icon" /> <span>END TIME</span>
                      </div>
                      <PremiumTimePicker 
                        label="Enter Departure Time"
                        value={bookingData.endTime}
                        onChange={(val) => setBookingData({ ...bookingData, endTime: val })}
                      />
                    </div>
                    {calculateCost() > 0 && (
                      <div className="cost-preview">
                        <span>Estimated Cost:</span>
                        <span className="cost-amount">₹{calculateCost()}</span>
                      </div>
                    )}
                    <button type="submit" className="btn btn-primary btn-block" disabled={otpSending}>
                      {otpSending ? 'Processing...' : 'Confirm Registration & Send OTP'}
                    </button>
                  </form>
                </>
              ) : (
                /* Step 2: OTP Form */
                <>
                  <form onSubmit={handleVerifyAndBook}>
                    <div className="otp-info">
                      <FaShieldAlt className="otp-info-icon" />
                      <p>We've sent a 6-digit OTP to <strong>{user?.email}</strong></p> {/* Changed from user.phone to user.email */}
                    </div>
                    <div className="form-group">
                      <label htmlFor="otp">
                        <FaShieldAlt /> Enter Verify OTP
                      </label>
                      <input
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        required
                        className="otp-input"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={bookingLoading}>
                      {bookingLoading ? 'Verifying...' : 'Verify & Book'}
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-outline btn-block"
                      onClick={() => setStep(1)}
                      style={{ marginTop: '12px' }}
                    >
                      ← Back to Details
                    </button>
                    <button
                      type="button"
                      className="btn-text"
                      onClick={handleSendOTP}
                      disabled={otpSending}
                      style={{ marginTop: '12px', width: '100%', textAlign: 'center' }}
                    >
                      {otpSending ? 'Resending...' : 'Resend OTP'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingSlots;

