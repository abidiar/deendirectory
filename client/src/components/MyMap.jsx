import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  height: "400px",
  width: "100%"
};

const Map = ({ businesses, center }) => {
  return (
    <LoadScript googleMapsApiKey={process.env.GOOGLE_GEO_API_KEY
    }>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
      >
        {businesses.map((business, index) => (
          <Marker 
            key={index} 
            position={{ lat: parseFloat(business.latitude), lng: parseFloat(business.longitude) }}
            // Optional: Include onClick here if you want to add some interaction when a marker is clicked
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
