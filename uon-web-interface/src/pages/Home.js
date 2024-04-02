import React, { useEffect, useRef } from 'react';
import Globe from 'globe.gl';

function Home() {
    const globeEl = useRef();

    useEffect(() => {
        const globe = Globe()(globeEl.current)
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
            .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
            .pointOfView({ altitude: 2 });

        function fetchISSPosition() {
            const script = document.createElement('script');
            const callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;
            script.src = `http://api.open-notify.org/iss-now.json?callback=${callbackName}`;
            document.body.appendChild(script);

            window[callbackName] = function(data) {
                const lat = data.iss_position.latitude;
                const lon = data.iss_position.longitude;

                globe.pointsData([{
                    lat: Number(lat),
                    lng: Number(lon),
                    color: 'red',
                    altitude: 0.1,
                    radius: 0.5,
                }])
                .pointAltitude('altitude')
                .pointColor('color')
                .pointRadius('radius');

                delete window[callbackName];
                document.body.removeChild(script);
            };
        }

        fetchISSPosition();
        const intervalId = setInterval(fetchISSPosition, 5000); // Update every 5 seconds

        return () => clearInterval(intervalId);
    }, []);

    return <div ref={globeEl} style={{ width: '100%', height: '600px' }} />;
}

export default Home;
