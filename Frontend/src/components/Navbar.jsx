import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCar, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <FaCar className="brand-icon" />
          <span>ParkNow</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          {!user ? (
            <>
              <NavLink to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</NavLink>
              <NavLink to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink to="/register" className="nav-link" onClick={() => setMenuOpen(false)}>Register</NavLink>
            </>
          ) : user.role === 'admin' ? (
            <>
              <NavLink to="/admin" end className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to="/admin/parking-areas" className="nav-link" onClick={() => setMenuOpen(false)}>Manage Areas</NavLink>
              <NavLink to="/admin/bookings" className="nav-link" onClick={() => setMenuOpen(false)}>Bookings</NavLink>
              <span className="nav-user">Hi, {user.name}</span>
              <button onClick={handleLogout} className="btn-nav btn-logout">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to="/parking-areas" className="nav-link" onClick={() => setMenuOpen(false)}>Find Parking</NavLink>
              <NavLink to="/bookings" className="nav-link" onClick={() => setMenuOpen(false)}>My Bookings</NavLink>
              <span className="nav-user">Hi, {user.name}</span>
              <button onClick={handleLogout} className="btn-nav btn-logout">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
