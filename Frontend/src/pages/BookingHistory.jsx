import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCar, FaMapMarkerAlt, FaClock, FaTimesCircle, FaCheckCircle, FaBan } from 'react-icons/fa';

const BookingHistory = () => {
  const { API_URL } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings/my`);
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await axios.put(`${API_URL}/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle />;
      case 'cancelled': return <FaBan />;
      case 'completed': return <FaCheckCircle />;
      default: return null;
    }
  };

  return (
    <div className="page-container theme-dashboard">
      <div className="page-header">
        <h1>Booking <span className="gradient-text">History</span></h1>
        <p>View and manage your parking reservations</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'confirmed', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="tab-count">
              {f === 'all' ? bookings.length : bookings.filter((b) => b.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <FaCar className="empty-icon" />
          <h3>No Bookings Found</h3>
          <p>{filter === 'all' ? 'You haven\'t made any bookings yet' : `No ${filter} bookings`}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Parking Area</th>
                <th>Slot</th>
                <th>Vehicle</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <div className="cell-with-icon">
                      <FaMapMarkerAlt />
                      <div>
                        <strong>{booking.parkingArea?.name || 'N/A'}</strong>
                        <small>{booking.parkingArea?.location || ''}</small>
                      </div>
                    </div>
                  </td>
                  <td>S{booking.parkingSlot?.slotNumber || 'N/A'}</td>
                  <td><span className="vehicle-badge">{booking.vehicleNumber}</span></td>
                  <td>{new Date(booking.startTime).toLocaleString()}</td>
                  <td>{new Date(booking.endTime).toLocaleString()}</td>
                  <td><strong>₹{booking.totalCost}</strong></td>
                  <td>
                    <span className={`status-badge status-${booking.status}`}>
                      {getStatusIcon(booking.status)} {booking.status}
                    </span>
                  </td>
                  <td>
                    {booking.status === 'confirmed' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(booking._id)}
                      >
                        <FaTimesCircle /> Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
