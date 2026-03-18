import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCar, FaClock, FaShieldAlt, FaMapMarkerAlt, FaMobileAlt, FaCheckCircle } from 'react-icons/fa';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🚗 Smart Parking Solution</div>
          <h1>Find & Reserve Parking <span className="gradient-text">In Seconds</span></h1>
          <p className="hero-description">
            No more circling around for parking spots. ParkNow lets you find, reserve, 
            and pay for parking spaces in real-time. Save time, reduce stress, and never 
            miss a spot again.
          </p>
          <div className="hero-buttons">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </>
            ) : (
              <Link to={user.role === 'admin' ? '/admin' : '/parking-areas'} className="btn btn-primary btn-lg">
                {user.role === 'admin' ? 'Admin Dashboard' : 'Find Parking Now'}
              </Link>
            )}
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Parking Spots</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Happy Users</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Locations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose <span className="gradient-text">ParkNow?</span></h2>
          <p>Experience the future of parking with our smart features</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaClock />
            </div>
            <h3>Real-Time Availability</h3>
            <p>See available parking spots instantly with live status updates. No guessing, no wasted time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaMapMarkerAlt />
            </div>
            <h3>Multiple Locations</h3>
            <p>Find parking across multiple locations in the city. Choose the nearest spot to your destination.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaMobileAlt />
            </div>
            <h3>Easy Booking</h3>
            <p>Reserve your spot in just a few clicks. Quick, simple, and hassle-free booking process.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>
            <h3>Secure & Reliable</h3>
            <p>Your bookings and data are fully protected with industry-standard security measures.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaCar />
            </div>
            <h3>Advance Reservation</h3>
            <p>Plan ahead by reserving your parking space in advance. Never worry about availability.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaCheckCircle />
            </div>
            <h3>Booking History</h3>
            <p>Keep track of all your past and current reservations with detailed booking records.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It <span className="gradient-text">Works</span></h2>
          <p>Get started in three simple steps</p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Search Location</h3>
            <p>Browse available parking areas near your destination</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Choose a Slot</h3>
            <p>Select an available parking slot from the visual grid</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Confirm Booking</h3>
            <p>Enter your details and confirm your reservation instantly</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Park Smarter?</h2>
            <p style={{ color: 'white' }}>Join thousands of users who save time and avoid parking hassles every day.</p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Free Account
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <FaCar className="brand-icon" />
            <span>ParkNow</span>
          </div>
          <p className="footer-text">© 2026 ParkNow. Smart Parking Solutions for Modern Cities.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
