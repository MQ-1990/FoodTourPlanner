import { useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Restaurant } from '../../lib/data';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapPanelProps {
  filteredRestaurants: Restaurant[];
  tourStops: Restaurant[];
  selectedRestaurant: Restaurant | null;
  selectedTour: any | null;
  tourName: string;
  handleMapDotClick: (restaurant: Restaurant) => void;
  toggleRestaurantSelection: (restaurant: Restaurant) => void;
  getTourRestaurants: (tour: any) => Restaurant[];
}

// Component to handle map centering when a restaurant is selected
const MapCenterer = ({ selectedRestaurant }: { selectedRestaurant: Restaurant | null }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedRestaurant) {
      map.setView([selectedRestaurant.lat, selectedRestaurant.lng], 15, { animate: true });
    }
  }, [selectedRestaurant, map]);
  return null;
};

// Component to handle fitting map bounds to the tour route
const RouteFitter = ({ tourStops }: { tourStops: Restaurant[] }) => {
  const map = useMap();
  useEffect(() => {
    if (tourStops.length > 0) {
      const bounds = L.latLngBounds(tourStops.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [tourStops, map]);
  return null;
};

export const MapPanel = ({
  filteredRestaurants,
  tourStops,
  selectedRestaurant,
  selectedTour,
  tourName,
  handleMapDotClick,
  toggleRestaurantSelection,
  getTourRestaurants,
}: MapPanelProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Custom Icon Generator
  const createMarkerIcon = (restaurant: Restaurant, isInItinerary: boolean, isHighlighted: boolean) => {
    const bgColor = isInItinerary ? 'bg-[#2E86AB]' : 'bg-[#FF6B35]';
    const highlightClasses = isHighlighted ? 'ring-4 ring-yellow-400 animate-pulse scale-125' : '';
    
    return L.divIcon({
      className: 'bg-transparent border-none', // Override default Leaflet icon styles
      html: `
        <div class="relative flex flex-col items-center">
          <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${bgColor} ${highlightClasses}">
            <span class="text-[10px] text-white font-bold leading-none">${restaurant.priceRange}</span>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12], // Center of the circle
      popupAnchor: [0, -12]
    });
  };

  // HCMC center coordinates
  const defaultCenter: [number, number] = [10.7769, 106.7009];

  return (
    <div className="hidden lg:block flex-1 relative bg-gray-100 z-0">
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[600]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 font-medium">Đang tải bản đồ...</p>
          </div>
        </div>
      )}

      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        whenReady={() => setIsLoading(false)}
      >
        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY || 'YOUR_GEOAPIFY_KEY_HERE'}`}
          attribution='&copy; <a href="https://www.geoapify.com/">Geoapify</a>'
        />

        <MapCenterer selectedRestaurant={selectedRestaurant} />
        <RouteFitter tourStops={tourStops} />

        {/* Render all filtered restaurants */}
        {filteredRestaurants.map((restaurant) => {
          const isInItinerary = tourStops.some((s) => s.id === restaurant.id);
          const isInViewedTour = selectedTour
            ? getTourRestaurants(selectedTour).some((r) => r.id === restaurant.id)
            : false;
            
          const isHighlighted = isInViewedTour || (selectedRestaurant?.id === restaurant.id);

          return (
            <Marker
              key={restaurant.id}
              position={[restaurant.lat, restaurant.lng]}
              icon={createMarkerIcon(restaurant, isInItinerary, isHighlighted)}
              eventHandlers={{
                click: () => handleMapDotClick(restaurant),
              }}
            >
              <Popup className="custom-popup">
                <div className="min-w-[200px]">
                  <h4 className="font-bold text-lg mb-1">{restaurant.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{restaurant.address}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-500 font-medium">★ {restaurant.rating}</span>
                    <span className="text-gray-500">•</span>
                    <span className="font-medium">{restaurant.priceRange}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRestaurantSelection(restaurant);
                    }}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      isInItinerary
                        ? 'bg-[#2E86AB] text-white'
                        : 'bg-[#FF6B35] text-white hover:bg-[#e55a2b]'
                    }`}
                  >
                    {isInItinerary ? '✓ Đã trong tour' : '+ Thêm vào tour'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Draw path between selected stops */}
        {tourStops.length > 1 && (
          <Polyline
            positions={tourStops.map((s) => [s.lat, s.lng])}
            color="#2E86AB"
            weight={4}
            dashArray="10, 10"
            lineCap="round"
          />
        )}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
        <div className="bg-white rounded-lg shadow-lg p-2">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
            <Navigation className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[400]">
        <p className="text-sm font-medium text-gray-700 mb-3">Legend</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#FF6B35]" />
            <span className="text-sm text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#2E86AB]" />
            <span className="text-sm text-gray-700">In Itinerary</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">Click dots to view details</p>
        </div>
      </div>

      {/* Tour Summary Overlay */}
      {tourStops.length > 0 && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-[400]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900">{tourName}</h3>
            <span className="text-xs bg-[#2E86AB] text-white px-2 py-1 rounded-full">
              {tourStops.length} stops
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Est. {(tourStops.length * 1.5).toFixed(1)} hours • {(tourStops.length * 2).toFixed(1)}km
          </p>
        </div>
      )}

      {/* My Location Button */}
      <div className="absolute bottom-8 right-8 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 z-[400]">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white ring-2 ring-blue-200" />
      </div>
    </div>
  );
};
