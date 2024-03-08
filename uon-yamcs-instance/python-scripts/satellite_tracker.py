from skyfield.api import Topos, load
import time

# Load data from satellite's TLE (Two-Line Element set)
# Replace these lines with the actual TLE of the satellite you're tracking
line1 = '1 25544U 98067A   20029.54791667  .00016717  00000-0  10270-3 0  9008'
line2 = '2 25544  51.6439  21.4865 0007417  47.9216 312.2044 15.49115111207256'

# Initialize a satellite object using its TLE
satellite = load.tle(line1, line2)

# Load a timescale object
ts = load.timescale()

# Loop to update satellite's position every 5 seconds
while True:
    # Get the current time
    t = ts.now()

    # Compute the satellite's position at the current time
    geocentric = satellite.at(t)

    # Convert the geocentric position to geographic coordinates (latitude, longitude, altitude)
    subpoint = geocentric.subpoint()

    # Print the current latitude, longitude, and altitude of the satellite
    print(f"Latitude: {subpoint.latitude.degrees}")
    print(f"Longitude: {subpoint.longitude.degrees}")
    print(f"Altitude: {subpoint.elevation.km} km")

    # Wait for 5 seconds before updating the position
    time.sleep(5)
