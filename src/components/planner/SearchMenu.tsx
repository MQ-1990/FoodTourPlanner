import { ChevronRight, Utensils, Route, Soup } from 'lucide-react';
import { PlannerState } from './types';

type Props = Pick<PlannerState, 'setShowSearchMenu' | 'setShowRestaurantSearch' | 'setShowTourSearch' | 'setShowDishSearch'>;

export const SearchMenu = ({ setShowSearchMenu, setShowRestaurantSearch, setShowTourSearch, setShowDishSearch }: Props) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Search</h2>
        <p className="text-gray-500 mb-6">What would you like to find?</p>

        <div className="space-y-4">
          {/* Search Restaurants Option */}
          <button
            onClick={() => {
              setShowSearchMenu(false);
              setShowRestaurantSearch(true);
              setShowTourSearch(false);
              setShowDishSearch(false);
            }}
            className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#FF6B35] hover:bg-orange-50/30 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0"
                style={{ backgroundColor: '#FF6B35' }}
              >
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900 text-lg">Search Restaurants</h3>
                <p className="text-sm text-gray-500">Find restaurants by name, cuisine, or location</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#FF6B35] transition-colors" />
            </div>
          </button>

          {/* Search Tours Option */}
          <button
            onClick={() => {
              setShowSearchMenu(false);
              setShowTourSearch(true);
              setShowRestaurantSearch(false);
              setShowDishSearch(false);
            }}
            className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#2E86AB] hover:bg-blue-50/30 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0"
                style={{ backgroundColor: '#2E86AB' }}
              >
                <Route className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900 text-lg">Search Tours</h3>
                <p className="text-sm text-gray-500">Discover curated food tours and itineraries</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#2E86AB] transition-colors" />
            </div>
          </button>

          {/* Search Dishes Option */}
          <button
            onClick={() => {
              setShowSearchMenu(false);
              setShowDishSearch(true);
              setShowRestaurantSearch(false);
              setShowTourSearch(false);
            }}
            className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0"
                style={{ backgroundColor: '#10B981' }}
              >
                <Soup className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900 text-lg">Search Dishes</h3>
                <p className="text-sm text-gray-500">Find specific foods and where to eat them</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
