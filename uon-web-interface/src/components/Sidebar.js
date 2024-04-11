import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';
// Import images
import homeIcon from '../icons/home.png';
import aboutIcon from '../icons/about.png'; 
import telemetryIcon from '../icons/telemetry.png';
import graphsIcon from '../icons/graph.png';
import timelineIcon from '../icons/timeline.png';

function Sidebar() {
  return (
    <div className="sidebar">
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            <img src={homeIcon} alt="Home" className="icon" /> Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
            <img src={aboutIcon} alt="About" className="icon" /> About
          </NavLink>
        </li>
        <li>
            <NavLink to="/telemetry" className={({ isActive }) => isActive ? 'active' : ''}>
                <img src={telemetryIcon} alt="Telemetry" className="icon" /> Telemetry
            </NavLink>
        </li>
        <li>
            <NavLink to="/graphs" className={({ isActive }) => isActive ? 'active' : ''}>
                <img src={graphsIcon} alt="Graphs" className="icon" /> Graphs
            </NavLink>
        </li>
        <li>
            <NavLink to="/timeline" className={({ isActive }) => isActive ? 'active' : ''}>
                <img src={timelineIcon} alt="Timeline" className="icon" /> Timeline
            </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
