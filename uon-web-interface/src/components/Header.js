import React, { useState, useEffect } from 'react';
import '../styles/Header.css';
import logoImage from '../images/logo.png'; // Ensure this path is correct

function Header() {
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString());
    }, 1000); // Update the time every second

    return () => clearInterval(timer); // Clear the timer on component unmount
  }, []);

  return (
    <div className="header">
      <div>
        Instance: 
        <select defaultValue="OBC">
          <option value="ADCS">ADCS</option>
          <option value="OBC">OBC</option>
        </select>
      </div>
      <div>
        <img src={logoImage} alt="Logo" className="logo" />
      </div>
      <div>{currentTime}</div>
    </div>
  );
}

export default Header;