import { Search, SlidersHorizontal, ChevronLeft, Soup } from 'lucide-react';
import { DISH_CUISINES, DISH_PREFERENCES, DISH_BUDGETS, DISH_DISTANCES, DISTRICTS } from './types';

interface DishSearchPanelProps {
  dishSearchQuery: string;
  setDishSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  showDishFilters: boolean;
  setShowDishFilters: React.Dispatch<React.SetStateAction<boolean>>;
  dishCuisine: string;
  setDishCuisine: React.Dispatch<React.SetStateAction<string>>;
  dishPreference: string;
  setDishPreference: React.Dispatch<React.SetStateAction<string>>;
  dishBudget: string;
  setDishBudget: React.Dispatch<React.SetStateAction<string>>;
  dishLocation: string;
  setDishLocation: React.Dispatch<React.SetStateAction<string>>;
  dishDistance: string;
  setDishDistance: React.Dispatch<React.SetStateAction<string>>;
  clearDishFilters: () => void;
  filteredDishes: any[];
  setSelectedDish: React.Dispatch<React.SetStateAction<any>>;
  setPreviousView: React.Dispatch<React.SetStateAction<any>>;
  setShowDishSearch: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSearchMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DishSearchPanel = ({
  dishSearchQuery, setDishSearchQuery,
  showDishFilters, setShowDishFilters,
  dishCuisine, setDishCuisine,
  dishPreference, setDishPreference,
  dishBudget, setDishBudget,
  dishLocation, setDishLocation,
  dishDistance, setDishDistance,
  clearDishFilters, filteredDishes,
  setSelectedDish, setPreviousView,
  setShowDishSearch, setShowSearchMenu,
}: DishSearchPanelProps) => {
  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Header & Search Bar */}
      <div className="p-4 border-b border-gray-200 bg-white z-20 relative">
        <button
          onClick={() => { setShowDishSearch(false); setShowSearchMenu(true); }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Search</span>
        </button>

        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 ring-emerald-500/50">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for dishes (e.g. Phở)..."
              value={dishSearchQuery}
              onChange={(e) => setDishSearchQuery(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
          <button
            onClick={() => setShowDishFilters(!showDishFilters)}
            className={`px-3 md:px-4 py-3 rounded-lg border flex items-center gap-2 transition-colors ${
              showDishFilters ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden md:inline">Filters</span>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-gray-600 text-sm">
            Found <span className="font-medium text-gray-900">{filteredDishes.length}</span> dishes
          </p>
        </div>

        {/* Dish Filters Dropdown */}
        {showDishFilters && (
          <div className="bg-gray-50 border-b border-gray-200 animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Cuisine */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">Cuisine</label>
                <div className="flex flex-wrap gap-2">
                  {DISH_CUISINES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setDishCuisine(dishCuisine === c ? '' : c)}
                      className={`px-3 py-1.5 rounded-full text-xs border ${dishCuisine === c ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-gray-300'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {DISH_PREFERENCES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setDishPreference(dishPreference === p ? '' : p)}
                      className={`px-3 py-1.5 rounded-full text-xs border ${dishPreference === p ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-gray-300'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">Budget</label>
                <select
                  value={dishBudget}
                  onChange={(e) => setDishBudget(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="">Any</option>
                  {DISH_BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* Location & Distance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Location</label>
                  <select
                    value={dishLocation}
                    onChange={(e) => setDishLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">Any</option>
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Distance</label>
                  <select
                    value={dishDistance}
                    onChange={(e) => setDishDistance(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">Any</option>
                    {DISH_DISTANCES.map((d) => <option key={d} value={d}>≤ {d} km</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={clearDishFilters}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 text-sm border-t border-gray-200 pt-3"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dish Results List */}
      <div className="flex-1 overflow-y-auto z-0">
        {filteredDishes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <Soup className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-center font-medium">No dishes found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredDishes.map((dish: any, idx: number) => (
              <div
                key={idx}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => {
                  setSelectedDish(dish);
                  setPreviousView('dish-search');
                  setShowDishSearch(false);
                }}
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={dish.image} alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{dish.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-emerald-600 font-bold text-sm">
                        {formatVND(dish.minPrice)}
                        {dish.minPrice !== dish.maxPrice && ` - ${formatVND(dish.maxPrice)}`}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {dish.restaurants.length} places
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
