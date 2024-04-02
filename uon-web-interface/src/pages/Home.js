import React, { useEffect, useRef } from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three'; // Make sure to import THREE
import '../styles/Home.css';

function Home() {
    const globeEl = useRef();
    
    useEffect(() => {
        const globe = Globe()(globeEl.current)
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
            .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
            .pointOfView({ altitude: 2 });

        const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers
        const SAT_SIZE = 100; // Desired satellite size in km
        // Calculate the satellite object scale
        const satObjScale = SAT_SIZE / EARTH_RADIUS_KM * globe.getGlobeRadius() * 2; 

        // Define the geometry and material for the satellite
        const satGeometry = new THREE.SphereGeometry(1, 16, 8); // Basic sphere geometry
        const satMaterial = new THREE.MeshLambertMaterial({ 
            color: 'red',
            transparent: true,
            opacity: 0.7 
        });

        globe.objectThreeObject(() => {
            const mesh = new THREE.Mesh(satGeometry, satMaterial);
            mesh.scale.set(satObjScale, satObjScale, satObjScale); // Apply scale
            return mesh;
        });

        function fetchISSPosition() {
            const script = document.createElement('script');
            const callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;
            window[callbackName] = function(data) {
                const lat = parseFloat(data.iss_position.latitude);
                const lon = parseFloat(data.iss_position.longitude);

                // Update the satellite position using objectsData
                globe.objectsData([{
                    lat: lat,
                    lng: lon,
                    altitude: 2,
                }]).objectAltitude(0.2);

                globe.pointOfView({ lat: lat, lng: lon}, 1000);

                globe.enablePointerInteraction(false)
    
                document.body.removeChild(script);
                delete window[callbackName];
            };
            script.src = `http://api.open-notify.org/iss-now.json?callback=${callbackName}`;
            document.body.appendChild(script);
        }

        fetchISSPosition();
        const intervalId = setInterval(fetchISSPosition, 5000); // Update every 5 seconds

        return () => clearInterval(intervalId);
    }, []);

    return <div ref={globeEl} className="globeContainer" />;
}

export default Home;
