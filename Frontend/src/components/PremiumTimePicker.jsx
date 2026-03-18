import React, { useState, useEffect, useRef } from 'react';
import { FaClock, FaCalendarAlt } from 'react-icons/fa';

const PremiumTimePicker = ({ label, value, onChange }) => {
  const dateObj = value ? new Date(value) : new Date();
  
  const [hours, setHours] = useState(dateObj.getHours() % 12 || 12);
  const [minutes, setMinutes] = useState(dateObj.getMinutes());
  const [isAM, setIsAM] = useState(dateObj.getHours() < 12);
  const [selectedDate, setSelectedDate] = useState(dateObj.toISOString().split('T')[0]);

  const clockRef = useRef(null);

  useEffect(() => {
    const newDate = new Date(selectedDate);
    let h = parseInt(hours);
    if (!isAM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    
    newDate.setHours(h, minutes, 0, 0);
    onChange(newDate.toISOString());
  }, [hours, minutes, isAM, selectedDate]);

  const handleClockClick = (e) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    
    const h = Math.round(angle / 30) || 12;
    setHours(h > 12 ? h - 12 : h);
  };

  const hourRotation = (hours % 12) * 30;

  return (
    <div className="premium-picker-v3">
      <div className="picker-v3-container">
        <h3 className="picker-v3-title">{label}</h3>
        
        <div className="selection-grid">
          <div className="time-input-box">
            <div className="digit-group">
                <span className="digit">{hours.toString().padStart(2, '0')}</span>
                <span className="separator">:</span>
                <span className="digit">{minutes.toString().padStart(2, '0')}</span>
            </div>
            <div className="ampm-toggle-v3">
                <button type="button" className={isAM ? 'active' : ''} onClick={() => setIsAM(true)}>AM</button>
                <div className="divider"></div>
                <button type="button" className={!isAM ? 'active' : ''} onClick={() => setIsAM(false)}>PM</button>
            </div>
          </div>

          <div className="date-input-v3">
            <label><FaCalendarAlt /> Date</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="analog-clock-v3">
          <div className="clock-face-v3" ref={clockRef} onClick={handleClockClick}>
            {[...Array(12)].map((_, i) => {
              const num = i + 1;
              const angle = (num * 30) - 90;
              // Radius is roughly 40% of the container
              const x = 40 * Math.cos(angle * (Math.PI / 180));
              const y = 40 * Math.sin(angle * (Math.PI / 180));
              return (
                <div 
                  key={num} 
                  className={`clock-num-v3 ${hours === num ? 'active' : ''}`}
                  style={{ 
                    left: `${50 + x}%`, 
                    top: `${50 + y}%`,
                    transform: 'translate(-50%, -50%)' 
                  }}
                >
                  {num.toString().padStart(2, '0')}
                </div>
              );
            })}
            
            <div className="clock-hand-v3" style={{ transform: `rotate(${hourRotation}deg)` }}>
              <div className="hand-point-v3" />
            </div>
            <div className="clock-center-v3" />
          </div>
        </div>

        <div className="minute-slider-v3">
          <div className="slider-header">
            <span>Minutes</span>
            <span className="val">{minutes.toString().padStart(2, '0')}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="59" 
            value={minutes} 
            onChange={(e) => setMinutes(parseInt(e.target.value))}
            className="modern-range-v3"
          />
        </div>
      </div>
    </div>
  );
};

export default PremiumTimePicker;
