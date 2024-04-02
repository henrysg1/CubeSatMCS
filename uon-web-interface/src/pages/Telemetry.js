import React, { useState, useEffect } from 'react';

function Telemetry() {
  const [parameterValues, setParameterValues] = useState({value: null});

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8090/api/websocket', 'json');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      
      // Construct and send the subscription request
      const subscribeRequest = {
        type: "parameters",
        id: 1, // Example ID, can be any unique number
        options: {
          instance: "ADCS",
          processor: "realtime",
          id: [{ name: "/adcs-xtce/ADCSGyroscopeX" }], // Add more parameters as needed
          action: "REPLACE", // Use "ADD" or "REMOVE" as needed
          abortOnInvalid: true,
          updateOnExpiration: false,
          sendFromCache: true,
          maxBytes: -1, // Example: no truncating
        }
      };

      ws.send(JSON.stringify(subscribeRequest));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Check if the message contains parameter values
      if (data.type === "parameters" && data.data.values) {
        const updatedValue = data.data.values[0].rawValue;
        setParameterValues({
          value: updatedValue.uint32Value,
        });
      }
    };
    

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>Welcome to My Simple React Website!</p>
        <p>{JSON.stringify(parameterValues.value)}</p>
      </header>
    </div>
  );
}

export default Telemetry;
