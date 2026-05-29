import { ChevronLeft, Star, MapPin, Utensils } from 'lucide-react';
import { Restaurant } from '../../lib/data';

interface DishDetailPanelProps {
  selectedDish: any;
  handleBackToResults: () => void;
  setSelectedDish: (d: any) => void;
  setPreviousView: (v: string) => void;
  setSelectedRestaurant: (r: Restaurant | null) => void;
}

export const DishDetailPanel = ({
  selectedDish, handleBackToResults,
  setSelectedDish, setPreviousView, setSelectedRestaurant,
}: DishDetailPanelProps) => {
  const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <div className="p-6">
      <button onClick={handleBackToResults} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft className="w-5 h-5" /><span>Back to Dishes</span>
      </button>
      <div className="space-y-6">
        {/* Hero */}
        <div className="w-full h-56 rounded-xl overflow-hidden bg-gray-100 relative">
          <img src={selectedDish.image} alt={selectedDish.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-3xl font-bold mb-1">{selectedDish.name}</h2>
            <p className="opacity-90 font-medium">
              {formatVND(selectedDish.minPrice)}
              {selectedDish.minPrice !== selectedDish.maxPrice && ' - ' + formatVND(selectedDish.maxPrice)}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">About this dish</h3>
          <p className="text-gray-600 leading-relaxed text-sm mb-3">
            {selectedDish.description} A flavorful choice popular among locals and visitors alike.
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedDish.tags && selectedDish.tags.map((tag: string, idx: number) => (
              <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">{tag}</span>
            ))}
          </div>
        </div>

        {/* Places */}
        <div>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Utensils className="w-4 h-4" /> Available at {selectedDish.restaurants.length} places
          </h3>
          <div className="space-y-3">
            {selectedDish.restaurants.map((restaurant: Restaurant) => {
              const specificDish = restaurant.dishes.find((d) => d.name.trim() === selectedDish.name);
              return (
                <div
                  key={restaurant.id}
                  className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-[#FF6B35] transition-colors cursor-pointer"
                  onClick={() => { setSelectedDish(null); setPreviousView('dish-search'); setSelectedRestaurant(restaurant); }}
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{restaurant.name}</h4>
                        <div className="flex flex-col items-end gap-1">
                          {specificDish && <span className="text-sm font-bold text-emerald-600">{specificDish.price} \u20ab</span>}
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Open</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-yellow-500 my-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-gray-700 font-medium">{restaurant.rating}</span>
                        <span className="text-gray-400">({restaurant.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{restaurant.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
