import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Restaurant } from '../lib/data';

// Fix icon cho Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapViewProps {
  restaurants: Restaurant[];
  tourStops: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onMarkerClick: (restaurant: Restaurant) => void;
}

export default function MapView({
  restaurants,
  tourStops,
  selectedRestaurant,
  onMarkerClick,
}: MapViewProps) {
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY || 'YOUR_GEOAPIFY_KEY_HERE';

  const [isLoading, setIsLoading] = useState(true);

  const center: [number, number] = [10.7769, 106.7009];
  const zoom = 13;

  // Tạo polyline cho route
  const routePositions: [number, number][] = tourStops.map((r) => [r.lat, r.lng]);

  return (
    <div className="relative h-full w-full">
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[600] rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 font-medium">Đang tải bản đồ...</p>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        className="z-0"
        whenReady={() => setIsLoading(false)} // Khi map load xong thì tắt loading
      >
        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${apiKey}`}
          attribution='&copy; <a href="https://www.geoapify.com/">Geoapify</a>'
        />

        {/* Markers cho tất cả nhà hàng */}
        {restaurants.map((restaurant) => {
          const isInTour = tourStops.some((s) => s.id === restaurant.id);
          const isSelected = selectedRestaurant?.id === restaurant.id;

          return (
            <Marker
              key={restaurant.id}
              position={[restaurant.lat, restaurant.lng]}
              eventHandlers={{
                click: () => onMarkerClick(restaurant),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h4 className="font-bold text-lg mb-1">{restaurant.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{restaurant.address}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-500 font-medium">★ {restaurant.rating}</span>
                    <span className="text-gray-500">•</span>
                    <span className="font-medium">{restaurant.priceRange}</span>
                  </div>

                  <button
                    onClick={() => onMarkerClick(restaurant)}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      isInTour
                        ? 'bg-[#2E86AB] text-white'
                        : 'bg-[#FF6B35] text-white hover:bg-[#e55a2b]'
                    }`}
                  >
                    {isInTour ? '✓ Đã trong tour' : '+ Thêm vào tour'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Vẽ đường route */}
        {routePositions.length >= 2 && (
          <Polyline
            positions={routePositions}
            color="#2E86AB"
            weight={5}
            opacity={0.85}
            dashArray="8, 6"
          />
        )}
      </MapContainer>
    </div>
  );
}