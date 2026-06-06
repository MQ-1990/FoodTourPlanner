import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Restaurant } from '../lib/data';   // ← ĐÃ CHỈNH

// Fix icon cho Leaflet (bắt buộc)
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

  // Tọa độ trung tâm TP.HCM
  const center: [number, number] = [10.7769, 106.7009];
  const zoom = 13;

  // Tạo polyline cho route
  const routePositions: [number, number][] = tourStops.map((r) => [r.lat, r.lng]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      className="z-0"
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
  );
}