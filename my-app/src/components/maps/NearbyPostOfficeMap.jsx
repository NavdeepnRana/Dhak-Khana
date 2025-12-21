import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDTq_QwXynEYrCenU50Ap3iLWAe5HX9GQo';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090, // Delhi coordinates as default
};

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Mock post offices data - In production, fetch from API based on user location
const getNearbyPostOffices = (userLat, userLng) => {
  // Generate mock post offices around user location
  const offices = [
    { name: 'Head Post Office', code: 'HPO001', lat: userLat + 0.01, lng: userLng + 0.01, contact: '011-23456789' },
    { name: 'Sub Post Office - Sector 1', code: 'SPO001', lat: userLat - 0.015, lng: userLng + 0.02, contact: '011-23456790' },
    { name: 'Sub Post Office - Sector 2', code: 'SPO002', lat: userLat + 0.02, lng: userLng - 0.01, contact: '011-23456791' },
    { name: 'Branch Post Office - Area A', code: 'BPO001', lat: userLat - 0.01, lng: userLng - 0.015, contact: '011-23456792' },
    { name: 'Branch Post Office - Area B', code: 'BPO002', lat: userLat + 0.015, lng: userLng + 0.025, contact: '011-23456793' },
  ];

  // Calculate distances and sort
  return offices.map(office => ({
    ...office,
    distance: calculateDistance(userLat, userLng, office.lat, office.lng),
  })).sort((a, b) => a.distance - b.distance);
};

export default function NearbyPostOfficeMap({ userLocation, onSelectOffice, selectedOffice }) {
  const [postOffices, setPostOffices] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserCoords(coords);
          const offices = getNearbyPostOffices(coords.lat, coords.lng);
          setPostOffices(offices);
        },
        () => {
          // Fallback to default location if geolocation fails
          const defaultCoords = userLocation || defaultCenter;
          setUserCoords(defaultCoords);
          const offices = getNearbyPostOffices(defaultCoords.lat, defaultCoords.lng);
          setPostOffices(offices);
        }
      );
    } else {
      // Fallback to default location
      const defaultCoords = userLocation || defaultCenter;
      setUserCoords(defaultCoords);
      const offices = getNearbyPostOffices(defaultCoords.lat, defaultCoords.lng);
      setPostOffices(offices);
    }
  }, [userLocation]);

  const center = useMemo(() => {
    if (userCoords) return userCoords;
    return defaultCenter;
  }, [userCoords]);

  const handleSelectOffice = (office) => {
    if (onSelectOffice) {
      onSelectOffice(office);
    }
  };

  if (!userCoords) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <p className="text-muted">Loading map...</p>
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={['places']}
      loadingElement={<div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>Loading map...</div>}
      errorElement={<div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>Error loading map. Please check your API key.</div>}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: '16px', 
        height: isMobile ? 'auto' : '500px' 
      }}>
        {/* Map Section */}
        <div style={{ 
          flex: isMobile ? 'none' : '2', 
          minWidth: isMobile ? '100%' : '400px',
          width: isMobile ? '100%' : 'auto',
          height: isMobile ? '400px' : '500px'
        }}>
          <GoogleMap
            mapContainerStyle={{
              width: '100%',
              height: isMobile ? '400px' : '500px',
            }}
            center={center}
            zoom={13}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {/* User Location Marker */}
            <Marker
              position={userCoords}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
              title="Your Location"
              onClick={() => setSelectedMarker('user')}
            />

            {/* Post Office Markers */}
            {postOffices.map((office, index) => (
              <Marker
                key={office.code}
                position={{ lat: office.lat, lng: office.lng }}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/postoffice-us.png',
                }}
                title={office.name}
                onClick={() => setSelectedMarker(office.code)}
              />
            ))}

            {selectedMarker === 'user' && (
              <InfoWindow
                position={userCoords}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div>
                  <strong>📍 Your Location</strong>
                </div>
              </InfoWindow>
            )}

            {postOffices.map((office) => (
              selectedMarker === office.code && (
                <InfoWindow
                  key={office.code}
                  position={{ lat: office.lat, lng: office.lng }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div>
                    <strong>🏤 {office.name}</strong>
                    <p className="small">Code: {office.code}</p>
                    <p className="small">Distance: {office.distance.toFixed(2)} km</p>
                    <p className="small">Contact: {office.contact}</p>
                  </div>
                </InfoWindow>
              )
            ))}
          </GoogleMap>
        </div>

        {/* Side List */}
        <div style={{ 
          flex: isMobile ? 'none' : '1', 
          width: isMobile ? '100%' : 'auto',
          background: '#fff', 
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '16px',
          overflowY: 'auto',
          maxHeight: isMobile ? '300px' : '500px',
          order: isMobile ? -1 : 0
        }}>
          <h5 style={{ marginBottom: '16px', fontWeight: '600' }}>Nearby Post Offices</h5>
          {postOffices.map((office) => (
            <div
              key={office.code}
              style={{
                padding: '12px',
                marginBottom: '8px',
                border: selectedOffice?.code === office.code ? '2px solid #007bff' : '1px solid #e0e0e0',
                borderRadius: '6px',
                cursor: 'pointer',
                background: selectedOffice?.code === office.code ? '#f0f7ff' : '#fff',
                transition: 'all 0.2s',
              }}
              onClick={() => handleSelectOffice(office)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = selectedOffice?.code === office.code ? '#f0f7ff' : '#fff';
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{office.name}</div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                Code: {office.code}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Distance: {office.distance.toFixed(2)} km
              </div>
              <button
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  background: selectedOffice?.code === office.code ? '#007bff' : '#f0f0f0',
                  color: selectedOffice?.code === office.code ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectOffice(office);
                }}
              >
                {selectedOffice?.code === office.code ? 'Selected' : 'Select'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </LoadScript>
  );
}


