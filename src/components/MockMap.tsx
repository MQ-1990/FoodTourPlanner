import React, { useEffect } from 'react';
import { Restaurant } from '../lib/data';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

interface MockMapProps {
  restaurants?: Restaurant[];
  highlightedId?: string;
  className?: string;
  center?: { x: number, y: number }; // For backward compatibility (x=lat, y=lng)
  zoom?: number;
  path?: { x: number, y: number }[]; // For backward compatibility
}

// Component to handle fitting map bounds to the markers
const MapBoundsFitter = ({ restaurants, center, zoom }: { restaurants: Restaurant[], center?: { x: number, y: number }, zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    if (restaurants.length > 1) {
      const bounds = L.latLngBounds(restaurants.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [30, 30], animate: true });
    } else if (restaurants.length === 1) {
      map.setView([restaurants[0].lat, restaurants[0].lng], zoom || 15);
    } else if (center) {
      map.setView([center.x, center.y], zoom || 13);
    }
  }, [restaurants, center, zoom, map]);
  return null;
};

export const MockMap = ({ restaurants = [], highlightedId, className = "", path, center, zoom }: MockMapProps) => {
  
  const createMarkerIcon = (restaurant: Restaurant, isHighlighted: boolean) => {
    const bgColor = isHighlighted ? 'bg-[#FF6B35]' : 'bg-[#2E86AB]';
    const highlightClasses = isHighlighted ? 'ring-4 ring-yellow-400 animate-pulse scale-125 z-50' : 'z-10';
    
    return L.divIcon({
      className: 'bg-transparent border-none', 
      html: `
        <div class="relative flex flex-col items-center">
          <div class="px-2 py-1 rounded shadow-md text-xs font-bold whitespace-nowrap mb-1 bg-white text-slate-800 absolute -top-8">
            ${restaurant.priceRange}
          </div>
          <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${bgColor} ${highlightClasses}">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Default to HCMC
  const defaultCenter: [number, number] = center ? [center.x, center.y] : (restaurants.length > 0 ? [restaurants[0].lat, restaurants[0].lng] : [10.7769, 106.7009]);

  return (
    <div className={`relative bg-gray-100 overflow-hidden z-0 ${className}`}>
      <MapContainer 
        center={defaultCenter} 
        zoom={zoom || 14} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <MapBoundsFitter restaurants={restaurants} center={center} zoom={zoom} />

        {/* Drawn Path for Planner backward compat */}
        {path && path.length > 1 && (
          <Polyline
            positions={path.map((p) => [p.x, p.y])}
            color="#FF6B35"
            weight={4}
            dashArray="8, 4"
            lineCap="round"
          />
        )}
        
        {/* Or if we just use restaurants array for path */}
        {!path && restaurants.length > 1 && (
          <Polyline
            positions={restaurants.map((s) => [s.lat, s.lng])}
            color="#FF6B35"
            weight={4}
            dashArray="8, 4"
            lineCap="round"
          />
        )}

        {/* Pins */}
        {restaurants.map((r) => (
          <Marker
            key={r.id}
            position={[r.lat, r.lng]}
            icon={createMarkerIcon(r, highlightedId === r.id)}
          >
            <Popup>
              <strong>{r.name}</strong><br/>{r.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
