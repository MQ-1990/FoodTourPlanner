import { MapPin, Navigation } from 'lucide-react';
import { Restaurant } from '../../lib/data';

interface MapPanelProps {
  filteredRestaurants: Restaurant[];
  tourStops: Restaurant[];
  selectedRestaurant: Restaurant | null;
  selectedTour: any | null;
  tourName: string;
  handleMapDotClick: (restaurant: Restaurant) => void;
  getTourRestaurants: (tour: any) => Restaurant[];
}

export const MapPanel = ({
  filteredRestaurants,
  tourStops,
  selectedRestaurant,
  selectedTour,
  tourName,
  handleMapDotClick,
  getTourRestaurants,
}: MapPanelProps) => {
  return (
    <div className="hidden lg:block flex-1 relative bg-gray-100">
      <div className="absolute inset-0 bg-[#E5F0F2]">
        {/* Fake map grid/streets */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(#2E86AB 1px, transparent 1px), linear-gradient(#f0f0f0 2px, transparent 2px), linear-gradient(90deg, #f0f0f0 2px, transparent 2px)',
            backgroundSize: '20px 20px, 100px 100px, 100px 100px',
          }}
        />

        {/* Fake River */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#a3d5e6] opacity-50 transform skew-x-12 translate-x-20" />

        {/* Map Pins - Clickable Dots */}
        <svg className="absolute inset-0 w-full h-full">
          {filteredRestaurants.map((restaurant) => {
            const isInItinerary = tourStops.find((s) => s.id === restaurant.id);
            const isInViewedTour = selectedTour
              ? getTourRestaurants(selectedTour).find((r) => r.id === restaurant.id)
              : false;
            const x = restaurant.lat;
            const y = restaurant.lng;

            return (
              <g
                key={restaurant.id}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleMapDotClick(restaurant)}
              >
                {/* Highlight ring for tour stops */}
                {isInViewedTour && (
                  <circle
                    cx={`${x}%`} cy={`${y}%`} r="32"
                    fill="none" stroke="#FCD34D" strokeWidth="3"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={`${x}%`} cy={`${y}%`} r="24"
                  fill={isInItinerary ? '#2E86AB' : '#FF6B35'}
                  className="drop-shadow-lg"
                />
                <text
                  x={`${x}%`} y={`${y}%`}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="white"
                  className="text-xs font-bold pointer-events-none select-none"
                >
                  {restaurant.priceRange}
                </text>
                <title>{restaurant.name}</title>
              </g>
            );
          })}

          {/* Draw path between selected stops */}
          {tourStops.length > 1 && (
            <polyline
              points={tourStops.map((s) => `${s.lat},${s.lng}`).join(' ')}
              fill="none" stroke="#2E86AB" strokeWidth="3"
              strokeDasharray="5,5" className="pointer-events-none"
            />
          )}
        </svg>

        {/* Pin marker for selected restaurant */}
        {selectedRestaurant && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${selectedRestaurant.lat}%`,
              top: `calc(${selectedRestaurant.lng}% - 50px)`,
              transform: 'translateX(-50%)',
            }}
          >
            <MapPin className="w-10 h-10 text-red-500 fill-red-500 animate-bounce drop-shadow-lg" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Your Location dot */}
      <div className="absolute bottom-8 right-8 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white ring-2 ring-blue-200" />
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-lg p-2">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
            <Navigation className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
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
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
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
    </div>
  );
};
