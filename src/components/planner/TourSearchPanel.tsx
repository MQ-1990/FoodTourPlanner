import { Search, SlidersHorizontal, ChevronLeft, Star, Clock, Route } from 'lucide-react';

interface TourSearchPanelProps {
  tourSearchQuery: string;
  setTourSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  showTourFilters: boolean;
  setShowTourFilters: React.Dispatch<React.SetStateAction<boolean>>;
  tourMinRating: number;
  setTourMinRating: React.Dispatch<React.SetStateAction<number>>;
  tourDurationFilter: string;
  setTourDurationFilter: React.Dispatch<React.SetStateAction<string>>;
  clearTourFilters: () => void;
  filteredTours: any[];
  handleTourClick: (tour: any) => void;
  setShowTourSearch: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSearchMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TourSearchPanel = ({
  tourSearchQuery, setTourSearchQuery,
  showTourFilters, setShowTourFilters,
  tourMinRating, setTourMinRating,
  tourDurationFilter, setTourDurationFilter,
  clearTourFilters, filteredTours, handleTourClick,
  setShowTourSearch, setShowSearchMenu,
}: TourSearchPanelProps) => {
  const durationOptions = [
    { value: '', label: 'All' },
    { value: 'short', label: '< 2h' },
    { value: 'medium', label: '2-3h' },
    { value: 'long', label: '> 3h' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Header & Search Bar */}
      <div className="p-4 border-b border-gray-200 bg-white z-20 relative">
        <button
          onClick={() => { setShowTourSearch(false); setShowSearchMenu(true); }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Search</span>
        </button>

        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 ring-[#2E86AB]/50">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tours..."
              value={tourSearchQuery}
              onChange={(e) => setTourSearchQuery(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
          <button
            onClick={() => setShowTourFilters(!showTourFilters)}
            className={`px-3 md:px-4 py-3 rounded-lg border flex items-center gap-2 transition-colors ${
              showTourFilters ? 'bg-[#2E86AB] text-white border-[#2E86AB]' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden md:inline">Filters</span>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-gray-600 text-sm">
            Found <span className="font-medium text-gray-900">{filteredTours.length}</span> tours
          </p>
        </div>

        {/* Filter Overlay */}
        {showTourFilters && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white shadow-xl border-b border-gray-200 animate-in slide-in-from-top-2">
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Minimum Rating: {tourMinRating > 0 ? tourMinRating : 'All'}
                </label>
                <input
                  type="range" min="0" max="5" step="0.5"
                  value={tourMinRating}
                  onChange={(e) => setTourMinRating(Number(e.target.value))}
                  className="w-full accent-[#2E86AB]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Duration</label>
                <div className="flex gap-2">
                  {durationOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTourDurationFilter(tourDurationFilter === option.value ? '' : option.value)}
                      className={`flex-1 px-3 py-2 rounded-lg border transition-colors text-sm ${
                        tourDurationFilter === option.value
                          ? 'bg-[#2E86AB] text-white border-[#2E86AB]'
                          : 'bg-white border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={clearTourFilters}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 text-sm border-t border-gray-200 pt-3"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tour Results List */}
      <div className="flex-1 overflow-y-auto p-4 z-0">
        {filteredTours.length === 0 ? (
          <div className="mt-12 text-center text-gray-500">
            <Route className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No tours found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:border-[#2E86AB] transition-colors cursor-pointer"
                onClick={() => handleTourClick(tour)}
              >
                <div className="h-32 overflow-hidden bg-gray-100">
                  <img
                    src={tour.image || '/placeholder.svg'}
                    alt={tour.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{tour.title || tour.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium text-gray-900">{tour.rating}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{tour.duration || 'N/A'}</span>
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
