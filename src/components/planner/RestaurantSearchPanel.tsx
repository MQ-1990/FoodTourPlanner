import { Search, SlidersHorizontal, ChevronLeft, ChevronDown, ChevronUp, MapPin, Star } from 'lucide-react';
import { Restaurant } from '../../lib/data';
import { PRICE_RANGES } from './types';

interface RestaurantSearchPanelProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPrice: string;
  setSelectedPrice: React.Dispatch<React.SetStateAction<string>>;
  minRating: number;
  setMinRating: React.Dispatch<React.SetStateAction<number>>;
  selectedDistrict: string;
  setSelectedDistrict: React.Dispatch<React.SetStateAction<string>>;
  selectedCuisine: string;
  setSelectedCuisine: React.Dispatch<React.SetStateAction<string>>;
  onlyOpen: boolean;
  setOnlyOpen: React.Dispatch<React.SetStateAction<boolean>>;
  clearFilters: () => void;
  filteredRestaurants: Restaurant[];
  tourStops: Restaurant[];
  showItinerary: boolean;
  handleToggleItinerary: () => void;
  handleRestaurantClick: (restaurant: Restaurant) => void;
  toggleRestaurantSelection: (restaurant: Restaurant) => void;
  setShowRestaurantSearch: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSearchMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RestaurantSearchPanel = ({
  searchQuery, setSearchQuery,
  showFilters, setShowFilters,
  selectedPrice, setSelectedPrice,
  minRating, setMinRating,
  selectedDistrict, setSelectedDistrict,
  selectedCuisine, setSelectedCuisine,
  onlyOpen, setOnlyOpen,
  clearFilters, filteredRestaurants,
  tourStops, showItinerary, handleToggleItinerary,
  handleRestaurantClick, toggleRestaurantSelection,
  setShowRestaurantSearch, setShowSearchMenu,
}: RestaurantSearchPanelProps) => {
  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Header & Search Bar */}
      <div className="p-4 border-b border-gray-200 bg-white z-20 relative">
        <button
          onClick={() => { setShowRestaurantSearch(false); setShowSearchMenu(true); }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Search</span>
        </button>

        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 ring-[#FF6B35]/50">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 md:px-4 py-3 rounded-lg border flex items-center gap-2 transition-colors ${
              showFilters ? 'bg-[#FF6B35] text-white border-[#FF6B35]' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden md:inline">Filters</span>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-gray-600 text-sm">
            Found <span className="font-medium text-gray-900">{filteredRestaurants.length}</span> restaurants
          </p>
          {tourStops.length > 0 && (
            <button
              onClick={handleToggleItinerary}
              className="bg-[#2E86AB] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-[#236B8A] transition-colors text-sm flex items-center gap-1 md:gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Itinerary</span>
              <span className="sm:hidden">Tour</span>
              ({tourStops.length})
              {showItinerary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Filter Overlay */}
        {showFilters && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white shadow-xl border-b border-gray-200 animate-in slide-in-from-top-2">
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm text-gray-700 mb-2">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35]"
                >
                  <option value="">All</option>
                  {["District 1", "District 2", "District 3", "District 4"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-2">Cuisine Type</label>
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35]"
                >
                  <option value="">All</option>
                  {["Vietnamese", "Phở", "Bánh Mì", "Coffee", "Seafood", "Fusion"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Price</label>
                <div className="flex gap-2">
                  {PRICE_RANGES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPrice(selectedPrice === p ? '' : p)}
                      className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                        selectedPrice === p
                          ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                          : 'bg-white border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Minimum Rating: {minRating > 0 ? minRating : 'All'}
                </label>
                <input
                  type="range" min="0" max="5" step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full accent-[#FF6B35]"
                />
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyOpen}
                  onChange={(e) => setOnlyOpen(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6B35]"
                />
                <span className="text-sm text-gray-700">Only show open restaurants</span>
              </label>
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 text-sm border-t border-gray-200 pt-3"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Restaurant Results List */}
      <div className="flex-1 overflow-y-auto z-0">
        {filteredRestaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <Search className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-center font-medium">No results found</p>
          </div>
        ) : (
          filteredRestaurants.map((restaurant) => {
            const isSelected = tourStops.find((s) => s.id === restaurant.id);
            return (
              <div
                key={restaurant.id}
                className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <div className="flex gap-4">
                  <div
                    className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => handleRestaurantClick(restaurant)}
                  >
                    <img
                      src={restaurant.image || '/placeholder.svg'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <button
                        onClick={() => handleRestaurantClick(restaurant)}
                        className="font-medium text-gray-900 hover:text-[#FF6B35] line-clamp-1 transition-colors text-left"
                      >
                        {restaurant.name}
                      </button>
                      <button
                        onClick={() => toggleRestaurantSelection(restaurant)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors flex-shrink-0 ${
                          isSelected ? 'bg-[#2E86AB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? '✓ Added' : '+ Add'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span>{restaurant.rating}</span>
                      <span className="text-gray-400">•</span>
                      <span>{restaurant.priceRange}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
