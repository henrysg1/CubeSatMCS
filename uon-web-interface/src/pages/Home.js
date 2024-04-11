import React, { useEffect, useRef } from 'react';
import '../styles/Home.css';
import IssMap from '../components/IssMap';

function Home() {
  return (
    <div className="home-container">
      <IssMap /> 
    </div>
  );
}

export default Home;
