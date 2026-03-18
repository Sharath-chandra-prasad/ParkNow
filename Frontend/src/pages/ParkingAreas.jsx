import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaMapMarkerAlt, FaCar, FaClock, FaRupeeSign } from 'react-icons/fa';

const ParkingAreas = () => {
  const { API_URL } = useAuth();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('All');
  const navigate = useNavigate();

  const states = ['All', ...new Set(areas.map(area => area.state).filter(Boolean))].sort();

  const filteredAreas = selectedState === 'All' 
    ? areas 
    : areas.filter(area => area.state === selectedState);

  const navRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({ opacity: 0 });

  useEffect(() => {
    if (!loading && states.length > 0) {
      const activeItem = navRef.current?.querySelector('.state-nav-item.active');
      if (activeItem) {
        setSliderStyle({
          width: `${activeItem.offsetWidth}px`,
          transform: `translateX(${activeItem.offsetLeft - 8}px)`, // Adjust for parent padding
          opacity: 1
        });
        
        // Ensure the active item is visible in the scrollable bar
        activeItem.scrollIntoView({ 
          behavior: 'smooth', 
          inline: 'center', 
          block: 'nearest' 
        });
      }
    }
  }, [selectedState, loading, states.length]);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${API_URL}/parking-areas`);
      setAreas(res.data);
    } catch (error) {
      console.error('Error fetching parking areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const wrapperRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onWheel = (e) => {
      e.preventDefault();
      const container = wrapper.querySelector('.horizontal-nav-container');
      if (container) {
        container.scrollLeft += e.deltaY + e.deltaX;
      }
    };

    wrapper.addEventListener('wheel', onWheel, { passive: false });
    return () => wrapper.removeEventListener('wheel', onWheel);
  }, [loading, states.length]);

  return (
    <div className="page-container theme-areas">
      <div className="page-header">
        <h1>Find <span className="gradient-text">Parking</span></h1>
        <p>Browse available parking areas categorized by state</p>
      </div>

      {!loading && states.length > 1 && (
        <div className="horizontal-nav-wrapper" ref={wrapperRef}>
          <div className="horizontal-nav-container">
            <div className="state-horizontal-nav" ref={navRef}>
              {states.map(state => (
                <button
                  key={state}
                  className={`state-nav-item ${selectedState === state ? 'active' : ''}`}
                  onClick={() => setSelectedState(state)}
                >
                  {state}
                </button>
              ))}
              <div className="active-slider-h" style={sliderStyle}></div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : filteredAreas.length === 0 ? (
        <div className="empty-state">
          <FaMapMarkerAlt className="empty-icon" />
          <h3>No Parking Areas Available</h3>
          <p>No parking areas found for {selectedState}. Please try another region.</p>
        </div>
      ) : (
        <div className="areas-grid">
          {filteredAreas.map((area) => (
            <div key={area._id} className="area-card" onClick={() => navigate(`/parking-slots/${area._id}`)}>
              <div className="area-card-top">
                <div className="area-card-icon">
                  <FaCar />
                </div>
                <h3>{area.name}</h3>
                <div className="area-location-tags">
                    <span className="tag-location"><FaMapMarkerAlt /> {area.location}</span>
                    <span className="tag-state">{area.state}</span>
                </div>
              </div>
              <div className="area-card-stats">
                <div className="area-stat">
                  <FaCar />
                  <span>{area.availableSlots} / {area.totalSlots} Available</span>
                </div>
                <div className="area-stat">
                  <span>₹{area.pricePerHour} / hour</span>
                </div>
              </div>
              {area.description && (
                <p className="area-description">{area.description}</p>
              )}
              <div className="area-card-footer">
                <div className="availability-bar">
                  <div
                    className="availability-fill"
                    style={{ width: `${(area.availableSlots / area.totalSlots) * 100}%` }}
                  ></div>
                </div>
                <span className="availability-text">
                  {area.availableSlots > 0 ? `${area.availableSlots} spots available` : 'Full'}
                </span>
              </div>
              <button className="btn btn-primary btn-block btn-sm">
                View Slots & Book
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParkingAreas;
