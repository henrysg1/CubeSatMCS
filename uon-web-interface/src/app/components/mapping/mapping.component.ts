import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'world-map',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.css']
})
export class MappingComponent implements AfterViewInit {
  options: any;
  map!: L.Map;
  satellitePath!: L.Polyline;
  satelliteMarker!: L.Marker;

  ngAfterViewInit(): void {
    this.initMap(); // Your method to initialize the map
    setTimeout(() => this.map.invalidateSize(), 0); // Invalidate size after view init
  }

  private initMap(): void {
    // Initialization logic for your map
    this.map = L.map('map', { /* options */ }).setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '...',
      maxZoom: 18,
      
    }).addTo(this.map);
  }

  onMapReady(map: L.Map) {
    this.map = map;
    // Initialize your satellite path and marker here
    // Example:
    this.satellitePath = L.polyline([], { color: 'red' }).addTo(map);
    this.satelliteMarker = L.marker([0, 0]).addTo(map);
    this.updateSatellitePosition(); // Fetch initial position and start updating
  }

  updateSatellitePosition() {
    // Fetch satellite position from YAMCS or another source
    // Update satellite path and marker location
    // Example:
    // this.satelliteMarker.setLatLng(new L.LatLng(lat, lng));
    // this.satellitePath.addLatLng(new L.LatLng(lat, lng));
    this.satelliteMarker.setLatLng(new L.LatLng(51.5, -0.09));
    this.satellitePath.addLatLng(new L.LatLng(51.5, -0.09));
  }

}
