import React, { useMemo, useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Navigation } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDTq_QwXynEYrCenU50Ap3iLWAe5HX9GQo';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090,
};

// Helper function to get coordinates from city name
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

export default function PickupBoyNavigationMap({ 
  address, 
  city, 
  type = 'pickup', // 'pickup' or 'delivery'
  currentLocation 
}) {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const destinationCoords = useMemo(() => {
    if (city) {
      return getCityCoordinates(city);
    }
    return defaultCenter;
  }, [city]);

  const userLocation = useMemo(() => {
    if (currentLocation) {
      return currentLocation;
    }
    // Default to a location slightly offset from destination for demo
    return {
      lat: destinationCoords.lat - 0.01,
      lng: destinationCoords.lng - 0.01,
    };
  }, [currentLocation, destinationCoords]);

  const center = useMemo(() => {
    return {
      lat: (userLocation.lat + destinationCoords.lat) / 2,
      lng: (userLocation.lng + destinationCoords.lng) / 2,
    };
  }, [userLocation, destinationCoords]);

  const calculateRoute = () => {
    if (!directionsService || !window.google || !window.google.maps) return;

    setIsNavigating(true);
    directionsService.route(
      {
        origin: userLocation,
        destination: destinationCoords,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
        } else {
          console.error('Directions request failed:', status);
        }
        setIsNavigating(false);
      }
    );
  };

  const handleNavigate = () => {
    const addressString = address || city || '';
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressString)}`;
    window.open(mapUrl, '_blank');
  };

  const onLoad = (map) => {
    const service = new window.google.maps.DirectionsService();
    setDirectionsService(service);
    
    // Auto-calculate route when component loads
    setTimeout(() => {
      calculateRoute();
    }, 500);
  };

  return (
    <LoadScript 
      googleMapsApiKey={GOOGLE_MAPS_API_KEY} 
      libraries={['places']}
      loadingElement={<div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>Loading map...</div>}
      errorElement={<div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#d32f2f' }}>Error loading map. Please check your API key.</div>}
    >
      <div>
        <div style={{ 
          marginBottom: '12px', 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '8px' : '0'
        }}>
          <div>
            <h5 style={{ margin: 0, fontWeight: '600', fontSize: isMobile ? '14px' : '16px' }}>
              {type === 'pickup' ? '📍 Pickup Location' : '📍 Delivery Location'}
            </h5>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>
              {address || city || 'Address not available'}
            </p>
          </div>
          <button
            onClick={handleNavigate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: isMobile ? '8px 16px' : '10px 20px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: isMobile ? '12px' : '14px',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <Navigation size={isMobile ? 14 : 16} />
            Navigate
          </button>
        </div>

        <GoogleMap
          mapContainerStyle={{
            width: '100%',
            height: isMobile ? '350px' : '500px',
          }}
          center={center}
          zoom={13}
          onLoad={onLoad}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {/* Current Location Marker (Pickup Boy) */}
          <Marker
            position={userLocation}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
            title="Your Location"
          />

          {/* Destination Marker (Pickup/Delivery Address) */}
          <Marker
            position={destinationCoords}
            icon={{
              url: type === 'pickup' 
                ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            }}
            title={type === 'pickup' ? 'Pickup Address' : 'Delivery Address'}
          />

          {/* Route */}
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>

        {isNavigating && (
          <div style={{ 
            padding: '12px', 
            background: '#f0f7ff', 
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center',
            fontSize: '14px',
            color: '#666'
          }}>
            Calculating route...
          </div>
        )}
      </div>
    </LoadScript>
  );
}


