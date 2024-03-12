import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Make sure to import the Leaflet CSS

const Map = ({ businesses, center }) => {
  return (
    <MapContainer center={center} zoom={12} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {businesses.map((business, index) => (
        <Marker 
          key={index} 
          position={[business.latitude, business.longitude]}
        >
          <Popup>
            {business.name} // You can customize this Popup to show any information you want about the business
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
