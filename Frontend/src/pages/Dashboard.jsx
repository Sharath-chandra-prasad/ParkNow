import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaCar, FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Dashboard = () => {
  const { user, API_URL } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  return (
    <div className="page-container theme-dashboard">
      <div className="page-header">
        <h1>Welcome, <span className="gradient-text">{user?.name}</span></h1>
        <p>Manage your parking reservations</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon blue">
            <FaCalendarAlt />
          </div>
          <div className="stat-card-info">
            <h3>{bookings.length}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green">
            <FaCar />
          </div>
          <div className="stat-card-info">
            <h3>{activeBookings.length}</h3>
            <p>Active Reservations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon purple">
            <FaClock />
          </div>
          <div className="stat-card-info">
            <h3>{completedBookings.length}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      {/* Active Bookings */}
      <div className="section-card">
        <div className="section-card-header">
          <h2>Active Reservations</h2>
          <Link to="/parking-areas" className="btn btn-primary btn-sm">Book New Slot</Link>
        </div>
        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : activeBookings.length === 0 ? (
          <div className="empty-state">
            <FaCar className="empty-icon" />
            <h3>No Active Reservations</h3>
            <p>You don't have any active parking reservations</p>
            <Link to="/parking-areas" className="btn btn-primary">Find Parking</Link>
          </div>
        ) : (
          <div className="bookings-grid">
            {activeBookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-card-header">
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status}
                  </span>
                  <span className="booking-cost">₹{booking.totalCost}</span>
                </div>
                <h3>{booking.parkingArea?.name || 'Parking Area'}</h3>
                <div className="booking-details">
                  <p><FaMapMarkerAlt /> {booking.parkingArea?.location || 'N/A'}</p>
                  <p><FaCar /> Slot #{booking.parkingSlot?.slotNumber || 'N/A'}</p>
                  <p><FaClock /> {new Date(booking.startTime).toLocaleString()}</p>
                  <p><FaClock /> {new Date(booking.endTime).toLocaleString()}</p>
                </div>
                <p className="vehicle-number">Vehicle: {booking.vehicleNumber}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/parking-areas" className="action-card">
          <FaMapMarkerAlt className="action-icon" />
          <h3>Find Parking</h3>
          <p>Browse available parking areas</p>
        </Link>
        <Link to="/bookings" className="action-card">
          <FaCalendarAlt className="action-icon" />
          <h3>Booking History</h3>
          <p>View all your past bookings</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
