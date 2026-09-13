import { useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Restaurant } from '../../lib/data';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface MapPanelProps {
  filteredRestaurants: Restaurant[];
  tourStops: Restaurant[];
  routeGeometry: any | null;
  optimizationSummary: { routeDistanceKm?: number; routeTimeMinutes?: number } | null;
  startLocation: { lat: number; lon: number; label: string } | null;
  isPickingStartLocation: boolean;
  onPickStartLocation: (location: { lat: number; lon: number; label: string }) => void;
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
const RouteFitter = ({
  tourStops,
  startLocation,
}: {
  tourStops: Restaurant[];
  startLocation: { lat: number; lon: number } | null;
}) => {
  const map = useMap();
  useEffect(() => {
    const positions: [number, number][] = [
      ...(startLocation ? [[startLocation.lat, startLocation.lon] as [number, number]] : []),
      ...tourStops.map((stop) => [stop.lat, stop.lng] as [number, number]),
    ];
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [tourStops, startLocation, map]);
  return null;
};

const MapStartPicker = ({
  isPickingStartLocation,
  onPickStartLocation,
}: {
  isPickingStartLocation: boolean;
  onPickStartLocation: (location: { lat: number; lon: number; label: string }) => void;
}) => {
  const map = useMapEvents({
    click: (event) => {
      if (!isPickingStartLocation) return;
      onPickStartLocation({
        lat: event.latlng.lat,
        lon: event.latlng.lng,
        label: "Selected map location",
      });
    },
  });

  useEffect(() => {
    map.getContainer().style.cursor = isPickingStartLocation ? "crosshair" : "";
    return () => {
      map.getContainer().style.cursor = "";
    };
  }, [isPickingStartLocation, map]);

  return null;
};

const getRoutePositions = (geometry: any): [number, number][] => {
  if (!geometry) return [];

  const collectCoordinates = (coordinates: any): number[][] => {
    if (!Array.isArray(coordinates)) return [];

    if (
      coordinates.length >= 2 &&
      typeof coordinates[0] === 'number' &&
      typeof coordinates[1] === 'number'
    ) {
      return [coordinates];
    }

    return coordinates.flatMap(collectCoordinates);
  };

  return collectCoordinates(geometry.coordinates)
    .filter((coord) => Number.isFinite(coord[0]) && Number.isFinite(coord[1]))
    .map((coord) => [coord[1], coord[0]]);
};

const distanceBetween = (a: [number, number], b: [number, number]) => {
  const latDiff = a[0] - b[0];
  const lngDiff = a[1] - b[1];
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
};

const getStopConnectors = (
  routePositions: [number, number][],
  tourStops: Restaurant[],
): [number, number][][] => {
  if (routePositions.length === 0 || tourStops.length === 0) return [];

  return tourStops.map((stop) => {
    const stopPosition: [number, number] = [stop.lat, stop.lng];
    const nearestRoutePosition = routePositions.reduce(
      (nearest, current) =>
        distanceBetween(current, stopPosition) < distanceBetween(nearest, stopPosition)
          ? current
          : nearest,
      routePositions[0],
    );

    return [nearestRoutePosition, stopPosition];
  });
};

type RouteArrow = {
  position: [number, number];
  bearing: number;
};

const getRouteDirectionArrows = (routePositions: [number, number][]): RouteArrow[] => {
  const arrows: RouteArrow[] = [];
  const spacingMeters = 300;
  const maxArrows = 18;
  let distanceSinceLastArrow = spacingMeters;

  for (let index = 1; index < routePositions.length && arrows.length < maxArrows; index += 1) {
    const from = routePositions[index - 1];
    const to = routePositions[index];
    const segmentDistance = L.latLng(from).distanceTo(L.latLng(to));

    if (segmentDistance < 3) continue;

    distanceSinceLastArrow += segmentDistance;
    if (distanceSinceLastArrow < spacingMeters) continue;

    const midLatitude = ((from[0] + to[0]) / 2) * (Math.PI / 180);
    // The compass bearing is 0 degrees at north, while the arrow glyph points east at 0 degrees.
    const bearing = Math.atan2(
      (to[1] - from[1]) * Math.cos(midLatitude),
      to[0] - from[0],
    ) * (180 / Math.PI) - 90;

    arrows.push({
      position: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2],
      bearing,
    });
    distanceSinceLastArrow = 0;
  }

  return arrows;
};

const getSegmentKey = (from: [number, number], to: [number, number]) => {
  const pointKey = (point: [number, number]) => `${point[0].toFixed(5)},${point[1].toFixed(5)}`;
  const fromKey = pointKey(from);
  const toKey = pointKey(to);
  return fromKey < toKey ? `${fromKey}|${toKey}` : `${toKey}|${fromKey}`;
};

const RoadRouteLines = ({ routePositions }: { routePositions: [number, number][] }) => {
  const [, setViewportVersion] = useState(0);
  const map = useMapEvents({
    zoomend: () => setViewportVersion((value) => value + 1),
    moveend: () => setViewportVersion((value) => value + 1),
  });

  const segments = routePositions.slice(1).map((to, index) => {
    const from = routePositions[index];
    return { from, to, key: getSegmentKey(from, to) };
  });
  const occurrences = new Map<string, number>();
  segments.forEach((segment) => occurrences.set(segment.key, (occurrences.get(segment.key) || 0) + 1));
  const seen = new Map<string, number>();

  const offsetSegment = (from: [number, number], to: [number, number], offsetPixels: number) => {
    if (!offsetPixels) return [from, to] as [number, number][];

    const isCanonicalDirection = from[0] < to[0] || (from[0] === to[0] && from[1] <= to[1]);
    const canonicalFrom = isCanonicalDirection ? from : to;
    const canonicalTo = isCanonicalDirection ? to : from;
    const fromPoint = map.latLngToLayerPoint(L.latLng(canonicalFrom[0], canonicalFrom[1]));
    const toPoint = map.latLngToLayerPoint(L.latLng(canonicalTo[0], canonicalTo[1]));
    const deltaX = toPoint.x - fromPoint.x;
    const deltaY = toPoint.y - fromPoint.y;
    const length = Math.hypot(deltaX, deltaY);
    if (!length) return [from, to] as [number, number][];

    const normalX = -deltaY / length;
    const normalY = deltaX / length;
    return [from, to].map((position) => {
      const point = map.latLngToLayerPoint(L.latLng(position[0], position[1]));
      const shifted = map.layerPointToLatLng(L.point(
        point.x + normalX * offsetPixels,
        point.y + normalY * offsetPixels,
      ));
      return [shifted.lat, shifted.lng] as [number, number];
    });
  };

  const lines: { key: string; positions: [number, number][] }[] = [];
  let baseRun: [number, number][] = [];
  const flushBaseRun = () => {
    if (baseRun.length > 1) lines.push({ key: `base-${lines.length}`, positions: baseRun });
    baseRun = [];
  };

  segments.forEach((segment, index) => {
    const count = occurrences.get(segment.key) || 1;
    const occurrenceIndex = seen.get(segment.key) || 0;
    seen.set(segment.key, occurrenceIndex + 1);
    const offsetPixels = count > 1 ? (occurrenceIndex - (count - 1) / 2) * 6 : 0;

    if (offsetPixels === 0) {
      if (baseRun.length === 0) baseRun = [segment.from, segment.to];
      else baseRun.push(segment.to);
      return;
    }

    flushBaseRun();
    lines.push({
      key: `repeat-${index}`,
      positions: offsetSegment(segment.from, segment.to, offsetPixels),
    });
  });
  flushBaseRun();

  return (
    <>
      {lines.map((line) => (
        <Polyline
          key={line.key}
          positions={line.positions}
          color="#2E86AB"
          weight={4}
          lineCap="round"
        />
      ))}
    </>
  );
};
export const MapPanel = ({
  filteredRestaurants,
  tourStops,
  routeGeometry,
  optimizationSummary,
  startLocation,
  isPickingStartLocation,
  onPickStartLocation,
  selectedRestaurant,
  selectedTour,
  tourName,
  handleMapDotClick,
  toggleRestaurantSelection,
  getTourRestaurants,
}: MapPanelProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const routePositions = getRoutePositions(routeGeometry);
  const fallbackRoutePositions = [
    ...(startLocation ? [[startLocation.lat, startLocation.lon] as [number, number]] : []),
    ...tourStops.map((stop) => [stop.lat, stop.lng] as [number, number]),
  ];
  const displayedRoutePositions = routePositions.length > 0 ? routePositions : fallbackRoutePositions;
  const stopConnectors = routePositions.length > 0 ? getStopConnectors(routePositions, tourStops) : [];
  const routeDirectionArrows = routePositions.length > 1 ? getRouteDirectionArrows(routePositions) : [];
  
  // Custom Icon Generator
  const createMarkerIcon = (restaurant: Restaurant, isInItinerary: boolean, isHighlighted: boolean, stopNumber?: number) => {
    const bgColor = isInItinerary ? 'bg-[#2E86AB]' : 'bg-[#FF6B35]';
    const highlightClasses = isHighlighted ? 'ring-4 ring-yellow-400 animate-pulse scale-125' : '';
    
    return L.divIcon({
      className: 'bg-transparent border-none', // Override default Leaflet icon styles
      html: `
        <div class="relative flex flex-col items-center">
          <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${bgColor} ${highlightClasses}">
            <span class="text-[10px] text-white font-bold leading-none">${stopNumber ?? restaurant.priceRange}</span>
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
        minZoom={3}
        maxZoom={20}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        whenReady={() => setIsLoading(false)}
      >
        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY || 'YOUR_GEOAPIFY_KEY_HERE'}`}
          attribution='&copy; <a href="https://www.geoapify.com/">Geoapify</a>'
          maxZoom={20}
          maxNativeZoom={20}
        />

        <MapCenterer selectedRestaurant={selectedRestaurant} />
        <RouteFitter tourStops={tourStops} startLocation={startLocation} />
        <MapStartPicker
          isPickingStartLocation={isPickingStartLocation}
          onPickStartLocation={onPickStartLocation}
        />

        {startLocation && (
          <Marker
            position={[startLocation.lat, startLocation.lon]}
            icon={L.divIcon({
              className: "bg-transparent border-none",
              html: '<div style="position:relative;display:flex;height:38px;width:38px;align-items:center;justify-content:center;border:3px solid #ffffff;border-radius:50%;background:#059669;color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:800;box-shadow:0 3px 10px rgba(5,150,105,.55)">S<span style="position:absolute;top:40px;left:50%;transform:translateX(-50%);padding:2px 5px;border-radius:3px;background:#065f46;color:#ffffff;font-family:Arial,sans-serif;font-size:9px;font-weight:700;line-height:1;white-space:nowrap;letter-spacing:.3px">START</span></div>',
              iconSize: [38, 52],
              iconAnchor: [19, 19],
            })}
          >
            <Popup>Start: {startLocation.label}</Popup>
          </Marker>
        )}
        {/* Render all filtered restaurants */}
        {filteredRestaurants.map((restaurant) => {
          const tourStopIndex = tourStops.findIndex((stop) => stop.id === restaurant.id);
          const isInItinerary = tourStopIndex >= 0;
          const isInViewedTour = selectedTour
            ? getTourRestaurants(selectedTour).some((r) => r.id === restaurant.id)
            : false;
            
          const isHighlighted = isInViewedTour || (selectedRestaurant?.id === restaurant.id);

          return (
            <Marker
              key={restaurant.id}
              position={[restaurant.lat, restaurant.lng]}
              icon={createMarkerIcon(restaurant, isInItinerary, isHighlighted, isInItinerary ? tourStopIndex + 1 : undefined)}
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

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMapDotClick(restaurant);
                      }}
                      className="rounded-lg border border-[#2E86AB] px-2 py-2 text-sm font-medium text-[#2E86AB] transition-colors hover:bg-blue-50"
                    >
                      View details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRestaurantSelection(restaurant);
                      }}
                      className={`rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                        isInItinerary
                          ? 'bg-[#2E86AB] text-white'
                          : 'bg-[#FF6B35] text-white hover:bg-[#e55a2b]'
                      }`}
                    >
                      {isInItinerary ? '✓ In tour' : '+ Add to tour'}
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Draw path between selected stops. Repeated road segments are offset for readability. */}
        {routePositions.length > 1 ? (
          <RoadRouteLines routePositions={routePositions} />
        ) : displayedRoutePositions.length > 1 ? (
          <Polyline
            positions={displayedRoutePositions}
            color="#2E86AB"
            weight={4}
            dashArray="10, 10"
            lineCap="round"
          />
        ) : null}

        {routeDirectionArrows.map((arrow, index) => (
          <Marker
            key={`route-arrow-${index}`}
            position={arrow.position}
            interactive={false}
            icon={L.divIcon({
              className: 'bg-transparent border-none',
              html: `<div class="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#2E86AB] text-xs font-bold text-white shadow" style="transform: rotate(${arrow.bearing}deg)">&#10140;</div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          />
        ))}

        {stopConnectors.map((positions, index) => (
          <Polyline
            key={`stop-connector-${index}`}
            positions={positions}
            color="#2E86AB"
            weight={2}
            opacity={0.75}
            dashArray="4, 6"
            lineCap="round"
          />
        ))}
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
          <p className="text-xs text-gray-500">Click a marker for quick details</p>
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
            {optimizationSummary?.routeDistanceKm !== undefined && optimizationSummary?.routeTimeMinutes !== undefined
              ? `Road route: ${Number(optimizationSummary.routeDistanceKm).toFixed(2)} km • ${Math.round(Number(optimizationSummary.routeTimeMinutes))} min`
              : 'Route has not been optimized yet'}
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
