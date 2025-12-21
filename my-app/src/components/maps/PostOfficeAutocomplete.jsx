import React, { useState, useEffect, useRef } from 'react';
import { fetchAllCenters, searchCenters } from '../../services/api';

export default function PostOfficeAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search post office...',
  className = '',
  name = '',
  required = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allCenters, setAllCenters] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load all centers on mount
  useEffect(() => {
    const loadCenters = async () => {
      try {
        const centers = await fetchAllCenters();
        setAllCenters(centers || []);
      } catch (error) {
        console.error('Error loading centers:', error);
      }
    };
    loadCenters();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    
    if (onChange) {
      onChange(e);
    }

    if (inputValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Filter centers based on input
    const filtered = allCenters.filter(
      (center) =>
        center.name?.toLowerCase().includes(inputValue.toLowerCase()) ||
        center.code?.toLowerCase().includes(inputValue.toLowerCase()) ||
        center.city?.toLowerCase().includes(inputValue.toLowerCase()) ||
        center.serviceArea?.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 10);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  // Handle suggestion selection
  const handleSelect = (center) => {
    const displayValue = center.name || center.code || '';
    
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name,
          value: displayValue,
        },
      };
      onChange(syntheticEvent);
    }

    if (onSelect) {
      onSelect(center);
    }

    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (value && value.length >= 2) {
            const filtered = allCenters.filter(
              (center) =>
                center.name?.toLowerCase().includes(value.toLowerCase()) ||
                center.code?.toLowerCase().includes(value.toLowerCase()) ||
                center.city?.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 10);
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
          }
        }}
        placeholder={placeholder}
        className={className}
        required={required}
        autoComplete="off"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxHeight: '300px',
            overflowY: 'auto',
            marginTop: '4px',
          }}
        >
          {suggestions.map((center, index) => (
            <div
              key={center._id || center.code || index}
              onClick={() => handleSelect(center)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {center.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Code: {center.code}
                {center.city && ` • ${center.city}`}
                {center.serviceArea && ` • ${center.serviceArea}`}
              </div>
              {center.address && (
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                  {center.address}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


