import React from 'react';

function About() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to the UoN CubeSat Website</h1>
      <p>This is an example page of the React application.</p>
      
      {/* Example of adding an image */}
      <img src="../images/logo.png" alt="Descriptive Alt Text" style={{ maxWidth: '100%', height: 'auto' }} />

      {/* Additional content */}
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>
  );
}

export default About;
