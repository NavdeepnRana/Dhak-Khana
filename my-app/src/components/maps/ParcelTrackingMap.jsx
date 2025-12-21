import React, { useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDTq_QwXynEYrCenU50Ap3iLWAe5HX9GQo';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090, // Delhi coordinates as default
};

// Helper function to get coordinates from city name (simplified - in production, use geocoding API)
const getCityCoordinates = (cityName) => {
  const cityMap = {
    'Delhi': { lat: 28.6139, lng: 77.2090 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  };
  return cityMap[cityName] || defaultCenter;
};

// Get current location based on status
const getCurrentLocation = (parcel) => {
  const status = parcel.status || '';
  
  if (status.includes('Delivered')) {
    return getCityCoordinates(parcel.destinationCity);
  } else if (status.includes('Picked Up') || status.includes('Out for Delivery')) {
    // Midway between source and destination
    const source = getCityCoordinates(parcel.sourceCity);
    const dest = getCityCoordinates(parcel.destinationCity);
    return {
      lat: (source.lat + dest.lat) / 2,
      lng: (source.lng + dest.lng) / 2,
    };
  } else if (status.includes('In Transit') || status.includes('Arrived at Hub')) {
    // Closer to destination
    const source = getCityCoordinates(parcel.sourceCity);
    const dest = getCityCoordinates(parcel.destinationCity);
    return {
      lat: source.lat + (dest.lat - source.lat) * 0.7,
      lng: source.lng + (dest.lng - source.lng) * 0.7,
    };
  } else {
    // At source
    return getCityCoordinates(parcel.sourceCity);
  }
};

// Get status text
const getStatusText = (parcel) => {
  const status = parcel.status || '';
  if (status.includes('Delivered')) return 'Delivered';
  if (status.includes('Out for Delivery')) return 'Out for Delivery';
  if (status.includes('In Transit')) return 'In Transit';
  if (status.includes('Arrived at Hub') || status.includes('Reached Sorting Center')) return 'Reached Sorting Center';
  if (status.includes('Picked Up')) return 'Picked Up';
  return 'Booked';
};

export default function ParcelTrackingMap({ parcel }) {
  const [selectedMarker, setSelectedMarker] = React.useState(null);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate coordinates and center - must be before conditional return
  const sourceCoords = parcel ? getCityCoordinates(parcel.sourceCity) : defaultCenter;
  const destCoords = parcel ? getCityCoordinates(parcel.destinationCity) : defaultCenter;
  const currentCoords = parcel ? getCurrentLocation(parcel) : defaultCenter;
  const statusText = parcel ? getStatusText(parcel) : '';

  // Calculate center to show all markers
  const center = useMemo(() => {
    if (!parcel) return defaultCenter;
    const lats = [sourceCoords.lat, destCoords.lat, currentCoords.lat];
    const lngs = [sourceCoords.lng, destCoords.lng, currentCoords.lng];
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    };
  }, [parcel, sourceCoords, destCoords, currentCoords]);

  if (!parcel) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <p className="text-muted">No parcel data available</p>
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={['places']}
      loadingElement={<div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>Loading map...</div>}
      errorElement={<div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#d32f2f' }}>Error loading map. Please check your API key.</div>}
    >
      <div>
        <GoogleMap
          mapContainerStyle={{
            width: '100%',
            height: isMobile ? '300px' : '400px',
          }}
          center={center}
          zoom={6}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {/* Source Location Marker */}
          <Marker
            position={sourceCoords}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
            title="Source Location"
            onClick={() => setSelectedMarker('source')}
          />

          {/* Destination Location Marker */}
          <Marker
            position={destCoords}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            }}
            title="Destination Location"
            onClick={() => setSelectedMarker('dest')}
          />

          {/* Current Parcel Location Marker */}
          <Marker
            position={currentCoords}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
            title="Current Parcel Location"
            onClick={() => setSelectedMarker('current')}
          />

          {selectedMarker === 'source' && (
            <InfoWindow
              position={sourceCoords}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                <strong>📍 Source Location</strong>
                <p>{parcel.sourceCity}</p>
                <p className="small text-muted">{parcel.senderName}</p>
              </div>
            </InfoWindow>
          )}

          {selectedMarker === 'dest' && (
            <InfoWindow
              position={destCoords}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                <strong>📍 Destination Location</strong>
                <p>{parcel.destinationCity}</p>
                <p className="small text-muted">{parcel.receiverName}</p>
              </div>
            </InfoWindow>
          )}

          {selectedMarker === 'current' && (
            <InfoWindow
              position={currentCoords}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                <strong>🚚 Current Parcel Location</strong>
                <p>Status: {parcel.status}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
        
        {/* Status Text Below Map */}
        <div style={{ 
          padding: '16px', 
          background: '#fff', 
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <div style={{ 
            display: 'inline-block',
            padding: '8px 16px',
            background: '#f0f0f0',
            borderRadius: '20px',
            fontWeight: '500'
          }}>
            {statusText}
          </div>
        </div>
      </div>
    </LoadScript>
  );
}


