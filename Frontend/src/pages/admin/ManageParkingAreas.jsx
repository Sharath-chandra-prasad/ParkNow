import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaParking } from 'react-icons/fa';

const ManageParkingAreas = () => {
  const { API_URL } = useAuth();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    totalSlots: '',
    pricePerHour: '',
    description: '',
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${API_URL}/parking-areas`);
      setAreas(res.data);
    } catch (error) {
      console.error('Error fetching areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingArea(null);
    setFormData({ name: '', location: '', totalSlots: '', pricePerHour: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      location: area.location,
      totalSlots: area.totalSlots,
      pricePerHour: area.pricePerHour,
      description: area.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.totalSlots || !formData.pricePerHour) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingArea) {
        await axios.put(`${API_URL}/parking-areas/${editingArea._id}`, formData);
        toast.success('Parking area updated successfully');
      } else {
        await axios.post(`${API_URL}/parking-areas`, formData);
        toast.success('Parking area created successfully');
      }
      setShowModal(false);
      fetchAreas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (areaId) => {
    if (!window.confirm('Are you sure? This will delete all slots and cancel active bookings for this area.')) return;

    try {
      await axios.delete(`${API_URL}/parking-areas/${areaId}`);
      toast.success('Parking area deleted successfully');
      fetchAreas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="page-container theme-admin">
      <div className="page-header">
        <h1>Manage <span className="gradient-text">Parking Areas</span></h1>
        <p>Add, edit, or remove parking locations</p>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <h2>All Parking Areas ({areas.length})</h2>
          <button className="btn btn-primary btn-sm" onClick={openAddModal}>
            <FaPlus /> Add New Area
          </button>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : areas.length === 0 ? (
          <div className="empty-state">
            <FaParking className="empty-icon" />
            <h3>No Parking Areas</h3>
            <p>Add your first parking area to get started</p>
            <button className="btn btn-primary" onClick={openAddModal}>
              <FaPlus /> Add Parking Area
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Total Slots</th>
                  <th>Available</th>
                  <th>Price/Hour</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {areas.map((area) => (
                  <tr key={area._id}>
                    <td><strong>{area.name}</strong></td>
                    <td>{area.location}</td>
                    <td>{area.totalSlots}</td>
                    <td>
                      <span className={`status-badge ${area.availableSlots > 0 ? 'status-confirmed' : 'status-cancelled'}`}>
                        {area.availableSlots} available
                      </span>
                    </td>
                    <td>₹{area.pricePerHour}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-outline btn-sm" onClick={() => openEditModal(area)}>
                          <FaEdit /> Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(area._id)}>
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingArea ? 'Edit Parking Area' : 'Add Parking Area'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="areaName">Area Name *</label>
                  <input
                    type="text"
                    id="areaName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., City Center Parking"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="areaLocation">Location *</label>
                  <input
                    type="text"
                    id="areaLocation"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., MG Road, Bangalore"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="areaTotalSlots">Total Slots *</label>
                    <input
                      type="number"
                      id="areaTotalSlots"
                      value={formData.totalSlots}
                      onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
                      placeholder="e.g., 50"
                      min="1"
                      required
                      disabled={!!editingArea}
                    />
                    {editingArea && <small className="form-hint">Slots cannot be reduced once created</small>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="areaPricePerHour">Price Per Hour (₹) *</label>
                    <input
                      type="number"
                      id="areaPricePerHour"
                      value={formData.pricePerHour}
                      onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                      placeholder="e.g., 30"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="areaDescription">Description</label>
                  <textarea
                    id="areaDescription"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the parking area"
                    rows="3"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  {editingArea ? 'Update Parking Area' : 'Create Parking Area'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageParkingAreas;
