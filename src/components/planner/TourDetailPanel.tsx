import { ChevronLeft, Star, Clock, MapPin, Bookmark, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../../lib/data';
import { toast } from 'sonner';

interface TourDetailPanelProps {
  selectedTour: any;
  myTours: any[];
  savedTours: any[];
  setSavedTours: (t: any[]) => void;
  handleBackToResults: () => void;
  handleRestaurantClick: (r: Restaurant) => void;
  getTourRestaurants: (tour: any) => Restaurant[];
  loadTour: (tour: any) => void;
  handleEditMyTour: (t: any) => void;
  handleDeleteMyTour: (id: string) => void;
  removeSavedTour: (id: string) => void;
  setShowMyTours: (v: boolean) => void;
  setSelectedTour: (t: any) => void;
}

export const TourDetailPanel = ({
  selectedTour, myTours, savedTours, setSavedTours,
  handleBackToResults, handleRestaurantClick, getTourRestaurants,
  loadTour, handleEditMyTour, handleDeleteMyTour,
  removeSavedTour, setShowMyTours, setSelectedTour,
}: TourDetailPanelProps) => {
  const isMyTour = myTours.find((t) => t.id === selectedTour.id);
  const isSaved = savedTours.find((t) => t.id === selectedTour.id);
  const stopCount = Array.isArray(selectedTour.stops)
    ? selectedTour.stops.length
    : typeof selectedTour.stops === 'number' ? selectedTour.stops : 0;

  const toggleSave = () => {
    if (isSaved) {
      setSavedTours(savedTours.filter((t) => t.id !== selectedTour.id));
      toast.success('Removed from saved tours');
    } else {
      setSavedTours([...savedTours, selectedTour]);
      toast.success('Added to saved tours');
    }
  };

  return (
    <div className="p-6">
      <button onClick={handleBackToResults} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft className="w-5 h-5" /><span>Back</span>
      </button>
      <div className="space-y-4">
        {/* Image */}
        <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={selectedTour.image || (Array.isArray(selectedTour.stops) && selectedTour.stops[0]?.image) || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60'}
            alt={selectedTour.title || selectedTour.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedTour.title || selectedTour.name}</h2>
          <div className="flex items-center gap-4 flex-wrap mb-4">
            {selectedTour.rating && (
              <>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-bold text-gray-900">{selectedTour.rating}</span>
                </div>
                <span className="text-gray-400">\u2022</span>
              </>
            )}
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>{selectedTour.duration || (stopCount * 1.5).toFixed(1) + ' hrs'}</span>
            </div>
            <span className="text-gray-400">\u2022</span>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-5 h-5" /><span>{stopCount} stops</span>
            </div>
          </div>

          {selectedTour.description && <p className="text-gray-600 mb-4">{selectedTour.description}</p>}

          {selectedTour.tags && selectedTour.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedTour.tags.map((tag: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {isMyTour ? (
            <div className="flex flex-col gap-3 mb-4">
              <button onClick={() => handleEditMyTour(selectedTour)}
                className="w-full flex items-center justify-center gap-2 bg-[#2E86AB] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#236B8A] transition-colors">
                <Edit2 className="w-4 h-4" /> Edit Tour
              </button>
              <div className="grid grid-cols-2 gap-3">
                <Link to={'/tour/' + selectedTour.id}
                  className="flex items-center justify-center gap-2 border-2 border-[#2E86AB] text-[#2E86AB] px-4 py-3 rounded-lg font-medium hover:bg-[#2E86AB] hover:text-white transition-colors">
                  View Full Details
                </Link>
                <button onClick={toggleSave}
                  className={'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ' + (isSaved ? 'bg-pink-100 text-pink-600 border border-pink-200 hover:bg-pink-200' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50')}>
                  <Bookmark className={'w-4 h-4 ' + (isSaved ? 'fill-current' : '')} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>
              <button
                onClick={() => { if (window.confirm('Are you sure you want to delete this tour?')) { handleDeleteMyTour(selectedTour.id); setShowMyTours(true); setSelectedTour(null); } }}
                className="flex items-center justify-center gap-2 bg-white text-red-600 border border-red-200 px-4 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => loadTour(selectedTour)}
                  className="w-full flex items-center justify-center gap-2 bg-[#2E86AB] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#236B8A] transition-colors col-span-2">
                  Load into Planner
                </button>
                <Link to={'/tour/' + selectedTour.id}
                  className="flex items-center justify-center gap-2 border-2 border-[#2E86AB] text-[#2E86AB] px-4 py-3 rounded-lg font-medium hover:bg-[#2E86AB] hover:text-white transition-colors">
                  View Full Details
                </Link>
                <button onClick={toggleSave}
                  className={'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ' + (isSaved ? 'bg-pink-100 text-pink-600 border border-pink-200 hover:bg-pink-200' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50')}>
                  <Bookmark className={'w-4 h-4 ' + (isSaved ? 'fill-current' : '')} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tour Stops */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Stops on this tour</h3>
          <div className="space-y-3">
            {getTourRestaurants(selectedTour).map((restaurant, index) => (
              <div key={restaurant.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-[#FF6B35] transition-colors cursor-pointer"
                onClick={() => handleRestaurantClick(restaurant)}>
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF6B35] text-white font-bold text-sm shrink-0">{index + 1}</div>
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    <img src={restaurant.image || '/placeholder.svg'} alt={restaurant.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{restaurant.name}</h4>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-gray-900 text-sm">{restaurant.rating}</span>
                      </div>
                      <span className="text-gray-400 text-xs">\u2022</span>
                      <span className="text-gray-600 text-sm">{restaurant.priceRange}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{restaurant.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
