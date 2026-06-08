import { ChevronLeft, Star, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../../lib/data';
import { useRestaurants } from '../../context/RestaurantContext';

interface RestaurantDetailPanelProps {
  selectedRestaurant: Restaurant;
  tourStops: Restaurant[];
  handleBackToResults: () => void;
  toggleRestaurantSelection: (r: Restaurant) => void;
  setPreviousRestaurant: (r: Restaurant | null) => void;
  setPreviousView: (v: string) => void;
  setSelectedRestaurant: (r: Restaurant | null) => void;
  setSelectedDish: (d: any) => void;
}

export const RestaurantDetailPanel = ({
  selectedRestaurant, tourStops,
  handleBackToResults, toggleRestaurantSelection,
  setPreviousRestaurant, setPreviousView,
  setSelectedRestaurant, setSelectedDish,
}: RestaurantDetailPanelProps) => {
  const { restaurants: allRestaurants } = useRestaurants();
  const isInTour = tourStops.find((s) => s.id === selectedRestaurant.id);

  const handleDishClick = (dish: any) => {
    const dishName = dish.name.trim();
    const rawPrice = parseInt(dish.price.replace(/,/g, ''), 10) || 0;
    const aggregated: any = { name: dishName, image: dish.image, description: 'A popular choice among locals.', minPrice: rawPrice, maxPrice: rawPrice, restaurants: [], tags: new Set() };
    allRestaurants.forEach((repo) => {
      const found = repo.dishes.find((d) => d.name.trim() === dishName);
      if (found) {
        const p = parseInt(found.price.replace(/,/g, ''), 10) || 0;
        if (p < aggregated.minPrice) aggregated.minPrice = p;
        if (p > aggregated.maxPrice) aggregated.maxPrice = p;
        if (found.tags) found.tags.forEach((t: string) => aggregated.tags.add(t));
        aggregated.restaurants.push(repo);
      }
    });
    setPreviousRestaurant(selectedRestaurant);
    setPreviousView('restaurant-detail');
    setSelectedRestaurant(null);
    setSelectedDish({ ...aggregated, tags: Array.from(aggregated.tags) });
  };

  return (
    <div className="p-6">
      <button onClick={handleBackToResults} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft className="w-5 h-5" /><span>Back</span>
      </button>
      <div className="space-y-4">
        {/* Image */}
        <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
          <img src={selectedRestaurant.image || '/placeholder.svg'} alt={selectedRestaurant.name} className="w-full h-full object-cover" />
        </div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-900">{selectedRestaurant.name}</h2>
          <button
            onClick={() => toggleRestaurantSelection(selectedRestaurant)}
            className={'px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ' + (isInTour ? 'bg-[#2E86AB] text-white' : 'bg-[#FF6B35] text-white hover:bg-[#e55a2b]')}
          >
            {isInTour ? '\u2713 Added' : '+ Add'}
          </button>
        </div>
        {/* Rating */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            <span className="font-bold text-gray-900">{selectedRestaurant.rating}</span>
            <span className="text-gray-500">({selectedRestaurant.reviewCount})</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="font-medium text-gray-700">{selectedRestaurant.priceRange}</span>
          {selectedRestaurant.openNow && (
            <><span className="text-gray-400">•</span><span className="font-medium text-green-600">Open now</span></>
          )}
        </div>
        {/* Address */}
        <div className="flex items-start gap-2 text-gray-600">
          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{selectedRestaurant.address}</span>
        </div>
        {/* Opening Hours */}
        {selectedRestaurant.openingTime && selectedRestaurant.closingTime && (
          <div className="flex items-start gap-2 text-gray-600 mt-1">
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{selectedRestaurant.openingTime} - {selectedRestaurant.closingTime}</span>
          </div>
        )}
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {selectedRestaurant.tags.map((tag, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{tag}</span>
          ))}
        </div>
        {/* Description */}
        {selectedRestaurant.description && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">About</h3>
            <p className="text-gray-600 leading-relaxed">{selectedRestaurant.description}</p>
          </div>
        )}
        {/* Amenities */}
        {selectedRestaurant.amenities && selectedRestaurant.amenities.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-2">
              {selectedRestaurant.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />{amenity}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Menu */}
        {selectedRestaurant.dishes && selectedRestaurant.dishes.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">Menu Highlights</h3>
            <div className="space-y-3">
              {selectedRestaurant.dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg -mx-1.5 transition-colors"
                  onClick={() => handleDishClick(dish)}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-[#FF6B35] transition-colors">{dish.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 text-xs font-bold">{dish.price} VNĐ</span>
                      {dish.isSignature && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">Signature</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Full Details Link */}
        <Link
          to={'/restaurant/' + selectedRestaurant.id}
          className="block w-full text-center px-4 py-3 border-2 border-[#FF6B35] text-[#FF6B35] rounded-lg font-medium hover:bg-[#FF6B35] hover:text-white transition-colors"
        >
          View Full Details
        </Link>
      </div>
    </div>
  );
};
