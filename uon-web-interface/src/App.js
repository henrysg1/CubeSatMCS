import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import About from './pages/About';
import Telemetry from './pages/Telemetry';
import Graphs from './pages/Graphs';
import Timeline from './pages/Timeline';

function App() {
  return (
    <Router>
      <div>
        <Header />
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <main style={{ flexGrow: 1, padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/telemetry" element={<Telemetry />} />
              <Route path="/graphs" element={<Graphs />} />
              <Route path="/timeline" element={<Timeline />} />            
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
