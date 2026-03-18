import React, { useState, useEffect } from 'react';

const CursorGlow = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHoveringText, setIsHoveringText] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target;
      // Detect if the cursor is over text-heavy elements or interactive text
      const isText = ['P', 'H1', 'H2', 'H3', 'H4', 'SPAN', 'A', 'LABEL', 'BUTTON', 'INPUT'].includes(target.tagName) || 
                     target.closest('.nav-link') || 
                     target.closest('.navbar-brand') ||
                     target.closest('.btn');
      
      setIsHoveringText(!!isText);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className={`cursor-glow ${isHoveringText ? 'active' : ''}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      }}
    />
  );
};

export default CursorGlow;
