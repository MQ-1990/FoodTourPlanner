import { ChevronLeft, Star, Heart, MapPin, Clock, X, Bookmark } from 'lucide-react';
import { Restaurant } from '../../lib/data';

interface SavedPanelProps {
  savedCategory: string | null;
  favoriteRestaurants: Restaurant[];
  savedTours: any[];
  handleRestaurantClick: (r: Restaurant) => void;
  removeFavorite: (id: string) => void;
  removeSavedTour: (id: string) => void;
  handleTourClick: (t: any) => void;
  setShowSaved: (v: boolean) => void;
  setSavedCategory: (v: string | null) => void;
  setShowSearchMenu: (v: boolean) => void;
  setShowTourMenu: (v: boolean) => void;
}

export const SavedPanel = ({
  savedCategory, favoriteRestaurants, savedTours,
  handleRestaurantClick, removeFavorite, removeSavedTour,
  handleTourClick, setShowSaved, setSavedCategory,
  setShowSearchMenu, setShowTourMenu,
}: SavedPanelProps) => {
  if (savedCategory === 'favorites') {
    return (
      <>
        <button
          onClick={() => { setShowSaved(false); setSavedCategory(null); setShowSearchMenu(true); }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-5 h-5" /><span>Back</span>
        </button>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Favorites</h2>
          <p className="text-sm text-gray-500 mt-1">
            {favoriteRestaurants.length} place{favoriteRestaurants.length !== 1 ? 's' : ''}
          </p>
        </div>
        {favoriteRestaurants.length === 0 ? (
          <div className="mt-12 text-center text-gray-500">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No favorites yet</p>
            <p className="text-sm mt-2">Save your favorite restaurants to find them easily later</p>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-[#FF6B35] transition-colors cursor-pointer"
                onClick={() => handleRestaurantClick(restaurant)}
              >
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    <img src={restaurant.image || '/placeholder.svg'} alt={restaurant.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 hover:text-[#FF6B35] line-clamp-1 transition-colors mb-2">{restaurant.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-gray-900 text-sm">{restaurant.rating}</span>
                      </div>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-600 text-sm">{restaurant.priceRange}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {restaurant.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFavorite(restaurant.id); }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Remove from favorites
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  // Saved Tours
  return (
    <>
      <button
        onClick={() => { setShowSaved(false); setSavedCategory(null); setShowTourMenu(true); }}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ChevronLeft className="w-5 h-5" /><span>Back</span>
      </button>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Saved Tours</h2>
        <p className="text-sm text-gray-500 mt-1">{savedTours.length} tour{savedTours.length !== 1 ? 's' : ''}</p>
      </div>
      {savedTours.length === 0 ? (
        <div className="mt-12 text-center text-gray-500">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">No saved tours yet</p>
          <p className="text-sm mt-2">Create and save tours to access them quickly later</p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedTours.map((tour) => {
            const stopCount = Array.isArray(tour.stops) ? tour.stops.length : tour.stops;
            return (
            <div
              key={tour.id}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-[#2E86AB] transition-colors cursor-pointer"
              onClick={() => handleTourClick(tour)}
            >
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  <img src={tour.image || '/placeholder.svg'} alt={tour.title || tour.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-1">{tour.title || tour.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{tour.duration}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{stopCount} stops</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 mb-2">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-gray-900 text-sm">{tour.rating}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSavedTour(tour.id); }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Remove from saved tours
                  </button>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </>
  );
};
