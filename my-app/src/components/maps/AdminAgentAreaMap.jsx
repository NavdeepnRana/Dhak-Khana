import React, { useState, useMemo, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Circle, InfoWindow } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDTq_QwXynEYrCenU50Ap3iLWAe5HX9GQo';

const containerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090, // Delhi coordinates as default
};

// Mock agent assignments - In production, fetch from API
const defaultAgentAreas = [
  {
    id: 'area1',
    name: 'North Zone',
    center: { lat: 28.65, lng: 77.20 },
    radius: 5000, // 5km radius in meters
    agentName: 'Rajesh Kumar',
    agentId: 'agent001',
    parcelCount: 12,
    color: '#FF6B6B',
  },
  {
    id: 'area2',
    name: 'South Zone',
    center: { lat: 28.58, lng: 77.20 },
    radius: 5000,
    agentName: 'Priya Sharma',
    agentId: 'agent002',
    parcelCount: 8,
    color: '#4ECDC4',
  },
  {
    id: 'area3',
    name: 'East Zone',
    center: { lat: 28.61, lng: 77.25 },
    radius: 5000,
    agentName: 'Amit Singh',
    agentId: 'agent003',
    parcelCount: 15,
    color: '#45B7D1',
  },
  {
    id: 'area4',
    name: 'West Zone',
    center: { lat: 28.61, lng: 77.15 },
    radius: 5000,
    agentName: 'Sneha Patel',
    agentId: 'agent004',
    parcelCount: 10,
    color: '#FFA07A',
  },
];

export default function AdminAgentAreaMap({ 
  city = 'Delhi',
  agentAreas = defaultAgentAreas,
  onAreaClick,
  onAgentAssign 
}) {
  const [selectedArea, setSelectedArea] = useState(null);
  const [areas, setAreas] = useState(agentAreas);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const center = useMemo(() => {
    if (areas.length === 0) return defaultCenter;
    
    // Calculate center of all areas
    const lats = areas.map(a => a.center.lat);
    const lngs = areas.map(a => a.center.lng);
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    };
  }, [areas]);

  const handleAreaClick = (area) => {
    setSelectedArea(area);
    if (onAreaClick) {
      onAreaClick(area);
    }
  };

  const handleAssignAgent = (area, agentName) => {
    const updatedAreas = areas.map(a => 
      a.id === area.id ? { ...a, agentName } : a
    );
    setAreas(updatedAreas);
    if (onAgentAssign) {
      onAgentAssign(area.id, agentName);
    }
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
          marginBottom: '16px', 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '12px' : '0'
        }}>
          <div>
            <h5 style={{ margin: 0, fontWeight: '600', fontSize: isMobile ? '14px' : '16px' }}>
              Agent Area Assignment - {city}
            </h5>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>
              Click on zones to view assigned agents and parcels
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            flexWrap: 'wrap',
            width: isMobile ? '100%' : 'auto'
          }}>
            <div style={{ 
              padding: '6px 12px', 
              background: '#f0f0f0', 
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              Total Zones: {areas.length}
            </div>
            <div style={{ 
              padding: '6px 12px', 
              background: '#f0f0f0', 
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              Total Parcels: {areas.reduce((sum, a) => sum + a.parcelCount, 0)}
            </div>
          </div>
        </div>

        <GoogleMap
          mapContainerStyle={{
            width: '100%',
            height: isMobile ? '400px' : '600px',
          }}
          center={center}
          zoom={11}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: !isMobile,
            fullscreenControl: true,
          }}
        >
          {/* Draw zones and markers for each area */}
          {areas.map((area) => (
            <React.Fragment key={area.id}>
              {/* Zone Circle */}
              <Circle
                center={area.center}
                radius={area.radius}
                options={{
                  fillColor: area.color,
                  fillOpacity: 0.2,
                  strokeColor: area.color,
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  clickable: true,
                }}
                onClick={() => handleAreaClick(area)}
              />

              {/* Zone Center Marker */}
              <Marker
                position={area.center}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                }}
                title={area.name}
                onClick={() => handleAreaClick(area)}
              />
            </React.Fragment>
          ))}

          {/* Info Window for selected area */}
          {selectedArea && (
            <InfoWindow
              position={selectedArea.center}
              onCloseClick={() => setSelectedArea(null)}
            >
              <div style={{ minWidth: '200px' }}>
                <h6 style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                  {selectedArea.name}
                </h6>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Assigned Agent:</strong>
                  <div style={{ marginTop: '4px' }}>
                    {selectedArea.agentName || (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>Not assigned</span>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Parcels in Zone:</strong> {selectedArea.parcelCount}
                </div>
                <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                  Zone ID: {selectedArea.id}
                </div>
                {onAgentAssign && (
                  <button
                    onClick={() => {
                      const agentName = prompt('Enter agent name:');
                      if (agentName) {
                        handleAssignAgent(selectedArea, agentName);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      background: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      marginTop: '8px',
                    }}
                  >
                    Assign Agent
                  </button>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Legend */}
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: '#f8f9fa', 
          borderRadius: '6px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontWeight: '600', marginRight: '8px' }}>Legend:</div>
          {areas.map((area) => (
            <div key={area.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: area.color,
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
              }} />
              <span style={{ fontSize: '12px' }}>
                {area.name} ({area.agentName || 'Unassigned'})
              </span>
            </div>
          ))}
        </div>
      </div>
    </LoadScript>
  );
}


