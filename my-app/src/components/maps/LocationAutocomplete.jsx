import React, { useRef, useEffect, useState } from 'react';

export default function LocationAutocomplete({ 
  value, 
  onChange, 
  onPlaceSelect,
  placeholder = 'Enter location',
  className = '',
  name = '',
  required = false
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) {
      return;
    }

    // Poll for Google Maps to load
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // Initialize autocomplete
    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['(cities)'],
          componentRestrictions: { country: 'in' }, // Restrict to India
        }
      );

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        if (place.formatted_address) {
          // Extract city name from formatted address
          const cityName = place.address_components?.find(component => 
            component.types.includes('locality') || 
            component.types.includes('administrative_area_level_2')
          )?.long_name || place.name || place.formatted_address.split(',')[0];
          
          // Update input value
          if (onChange) {
            const syntheticEvent = {
              target: {
                name: name,
                value: cityName,
              },
            };
            onChange(syntheticEvent);
          }
          
          // Call onPlaceSelect callback with full place data
          if (onPlaceSelect) {
            onPlaceSelect({
              city: cityName,
              fullAddress: place.formatted_address,
              coordinates: place.geometry?.location ? {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              } : null,
              place: place,
            });
          }
        }
      });
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }

    return () => {
      if (autocompleteRef.current && window.google && window.google.maps && window.google.maps.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onChange, onPlaceSelect, name]);

  return (
    <input
      ref={inputRef}
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      required={required}
      autoComplete="off"
    />
  );
}


