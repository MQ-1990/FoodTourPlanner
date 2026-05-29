import { Heart, Map, Search, MapPin } from 'lucide-react';
import { PlannerState } from './types';

type Props = Pick<PlannerState,
  'setIsPanelCollapsed' | 'setShowSaved' | 'setSavedCategory' | 'setShowMyTours' |
  'setShowItinerary' | 'setShowTourMenu' | 'setShowSearchMenu' | 'setShowTourSearch' |
  'setShowRestaurantSearch' | 'setShowDishSearch' | 'setSelectedRestaurant' | 'setSelectedTour' |
  'setSelectedDish' | 'tourStops'
>;

export const CollapsedSidebar = (props: Props) => {
  const {
    setIsPanelCollapsed, setShowSaved, setSavedCategory, setShowMyTours,
    setShowItinerary, setShowTourMenu, setShowSearchMenu, setShowTourSearch,
    setShowRestaurantSearch, setShowDishSearch, setSelectedRestaurant, setSelectedTour,
    setSelectedDish, tourStops,
  } = props;

  return (
    <div className="flex flex-col items-center py-6 gap-6 h-full">
      {/* Expand Button */}
      <button
        onClick={() => setIsPanelCollapsed(false)}
        className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
        title="Expand menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-600"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
      </button>

      {/* Saved/Favorites */}
      <button
        onClick={() => {
          setIsPanelCollapsed(false);
          setShowSaved(true);
          setSavedCategory('favorites');
          setShowMyTours(false);
          setShowItinerary(false);
          setShowTourMenu(false);
          setShowSearchMenu(false);
          setShowTourSearch(false);
          setShowRestaurantSearch(false);
          setSelectedRestaurant(null);
        }}
        className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-lg transition-colors group"
        title="Favorites"
      >
        <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center group-hover:bg-pink-600 transition-colors">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs text-gray-600 text-center leading-tight">Saved</span>
      </button>

      {/* Tour Menu */}
      <button
        onClick={() => {
          setIsPanelCollapsed(false);
          setShowTourMenu(true);
          setShowSaved(false);
          setShowMyTours(false);
          setShowItinerary(false);
          setShowSearchMenu(false);
          setShowTourSearch(false);
          setShowRestaurantSearch(false);
          setSelectedRestaurant(null);
        }}
        className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-lg transition-colors group"
        title="Tour Menu"
      >
        <div className="w-12 h-12 bg-[#2E86AB] rounded-lg flex items-center justify-center group-hover:bg-[#236B8A] transition-colors">
          <Map className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs text-gray-600 text-center leading-tight">Tour</span>
      </button>

      {/* Search */}
      <button
        onClick={() => {
          setIsPanelCollapsed(false);
          setShowSearchMenu(true);
          setShowRestaurantSearch(false);
          setShowTourSearch(false);
          setShowDishSearch(false);
          setShowItinerary(false);
          setShowSaved(false);
          setShowMyTours(false);
          setShowTourMenu(false);
          setSelectedRestaurant(null);
          setSelectedTour(null);
          setSelectedDish(null);
        }}
        className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-lg transition-colors group"
        title="Search"
      >
        <div className="w-12 h-12 bg-[#FF6B35] rounded-lg flex items-center justify-center group-hover:bg-[#e55a2b] transition-colors">
          <Search className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs text-gray-600 text-center leading-tight">Search</span>
      </button>

      {/* Active Itinerary Indicator */}
      {tourStops.length > 0 && (
        <button
          onClick={() => {
            setIsPanelCollapsed(false);
            setShowItinerary(true);
            setShowSaved(false);
            setShowMyTours(false);
            setShowTourMenu(false);
            setShowSearchMenu(false);
            setShowTourSearch(false);
            setShowRestaurantSearch(false);
            setSelectedRestaurant(null);
          }}
          className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-lg transition-colors group relative"
          title="View itinerary"
        >
          <div className="w-12 h-12 bg-white border-2 border-[#2E86AB] rounded-lg flex items-center justify-center group-hover:bg-[#2E86AB]/10 transition-colors relative">
            <MapPin className="w-6 h-6 text-[#2E86AB]" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {tourStops.length}
            </span>
          </div>
          <span className="text-xs text-gray-600 text-center leading-tight">Active</span>
        </button>
      )}
    </div>
  );
};
