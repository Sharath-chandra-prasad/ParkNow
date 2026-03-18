import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaCar, FaParking, FaCalendarAlt, FaRupeeSign, FaMapMarkerAlt, FaClock, FaMoneyBillWave } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user, API_URL } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/bookings/stats`),
        axios.get(`${API_URL}/bookings`),
      ]);
      setStats(statsRes.data);
      setRecentBookings(bookingsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
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
    <div className="page-container theme-admin">
      <div className="page-header">
        <h1>Admin <span className="gradient-text">Dashboard</span></h1>
        <p>Welcome back, {user?.name}. Here's your parking system overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid stats-grid-4">
        <div className="stat-card">
          <div className="stat-card-icon blue">
            <FaParking />
          </div>
          <div className="stat-card-info">
            <h3>{stats?.totalParkingAreas || 0}</h3>
            <p>Parking Areas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green">
            <FaCar />
          </div>
          <div className="stat-card-info">
            <h3>{stats?.availableSlots || 0} / {stats?.totalSlots || 0}</h3>
            <p>Available Slots</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon orange">
            <FaCalendarAlt />
          </div>
          <div className="stat-card-info">
            <h3>{stats?.totalBookings || 0}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon purple">
            <FaMoneyBillWave />
          </div>
          <div className="stat-card-info">
            <h3>₹{stats?.totalRevenue || 0}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="stats-grid">
        <div className="stat-card stat-card-mini">
          <div className="stat-card-info">
            <h3 className="text-green">{stats?.activeBookings || 0}</h3>
            <p>Active Bookings</p>
          </div>
        </div>
        <div className="stat-card stat-card-mini">
          <div className="stat-card-info">
            <h3 className="text-blue">{stats?.completedBookings || 0}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card stat-card-mini">
          <div className="stat-card-info">
            <h3 className="text-red">{stats?.cancelledBookings || 0}</h3>
            <p>Cancelled</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="section-card">
        <div className="section-card-header">
          <h2>Recent Reservations</h2>
          <Link to="/admin/bookings" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {recentBookings.length === 0 ? (
          <div className="empty-state">
            <FaCalendarAlt className="empty-icon" />
            <h3>No Bookings Yet</h3>
            <p>No reservations have been made yet</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Parking Area</th>
                  <th>Slot</th>
                  <th>Vehicle</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <div>
                        <strong>{booking.user?.name || 'N/A'}</strong>
                        <br />
                        <small>{booking.user?.email || ''}</small>
                      </div>
                    </td>
                    <td>{booking.parkingArea?.name || 'N/A'}</td>
                    <td>S{booking.parkingSlot?.slotNumber || 'N/A'}</td>
                    <td><span className="vehicle-badge">{booking.vehicleNumber}</span></td>
                    <td><strong>₹{booking.totalCost}</strong></td>
                    <td>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/admin/parking-areas" className="action-card">
          <FaMapMarkerAlt className="action-icon" />
          <h3>Manage Areas</h3>
          <p>Add, edit or remove parking areas</p>
        </Link>
        <Link to="/admin/bookings" className="action-card">
          <FaCalendarAlt className="action-icon" />
          <h3>All Bookings</h3>
          <p>View and manage all reservations</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
