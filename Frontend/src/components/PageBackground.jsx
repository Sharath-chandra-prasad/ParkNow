import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import bgAuth from '../assets/bg-auth.png';
import bgAreas from '../assets/bg-areas.png';
import bgSlots from '../assets/bg-slots.png';
import bgDashboard from '../assets/bg-dashboard.png';

const PageBackground = () => {
  const location = useLocation();
  const [currentBg, setCurrentBg] = useState(bgAuth);

  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/' || path === '/login' || path === '/register' || path === '/forgot-password') {
      setCurrentBg(bgAuth);
    } else if (path === '/parking-areas') {
      setCurrentBg(bgAreas);
    } else if (path.startsWith('/parking-slots/')) {
      setCurrentBg(bgSlots);
    } else if (path === '/dashboard' || path === '/booking-history') {
      setCurrentBg(bgDashboard);
    } else if (path.startsWith('/admin')) {
      setCurrentBg(bgDashboard); // Or generate admin-specific
    }
  }, [location.pathname]);

  const bgs = [bgAuth, bgAreas, bgSlots, bgDashboard];

  return (
    <div className="page-background">
      {bgs.map((bg) => (
        <div
          key={bg}
          className={`bg-layer ${currentBg === bg ? 'active' : ''}`}
          style={{ backgroundImage: `url(${bg})` }}
        />
      ))}
      <div className="hero-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="bg-overlay" />
    </div>
  );
};

export default PageBackground;
