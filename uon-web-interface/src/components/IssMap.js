import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import issIconImage from '../icons/satellite.png';

const issIcon = new L.Icon({
  iconUrl: issIconImage,
  iconSize: [50, 63],
  iconAnchor: [25, 31],
});

const IssMap = () => {
  const [issPosition, setIssPosition] = useState([0, 0]);
  const [issPositions, setIssPositions] = useState([]);

  const fetchIssPosition = async () => {
    const response = await fetch('http://api.open-notify.org/iss-now.json');
    const data = await response.json();
    const newPos = [data.iss_position.latitude, data.iss_position.longitude];
    setIssPosition(newPos);
    setIssPositions((prevPositions) => [...prevPositions.slice(-99), newPos]);
  };

  useEffect(() => {
    fetchIssPosition();
    const interval = setInterval(fetchIssPosition, 5000);
    return () => clearInterval(interval);
  }, []);

  const worldBounds = new L.LatLngBounds(
    new L.LatLng(-90, -180),
    new L.LatLng(90, 180)
  );

  return (
    <MapContainer
      center={issPosition}
      zoom={3}
      minZoom={2}
      maxZoom={10}
      style={{ height: 'calc(100vh - 150px)', width: '100%' }}
      maxBounds={worldBounds}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap={true}
      />
      <Marker position={issPosition} icon={issIcon}></Marker>
      <Polyline positions={issPositions} color="red" />
    </MapContainer>
  );
};

export default IssMap;
