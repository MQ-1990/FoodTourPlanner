import { ChevronLeft, Clock, Map, Search, Sparkles, Save, Edit2 } from 'lucide-react';
import { Restaurant } from '../../lib/data';
import { DraggableStop } from './DraggableStop';

interface ItineraryPanelProps {
  tourStops: Restaurant[];
  tourName: string;
  tourDescription: string;
  setTourDescription: (v: string) => void;
  tourTags: string[];
  setTourTags: (t: string[]) => void;
  availableTags: string[];
  isEditingName: boolean;
  setIsEditingName: (v: boolean) => void;
  tempName: string;
  setTempName: (v: string) => void;
  handleNameSave: () => void;
  handleNameCancel: () => void;
  moveStop: (from: number, to: number) => void;
  syncStopOrder: () => void;
  removeStop: (id: string) => void;
  handleRestaurantClick: (r: Restaurant) => void;
  optimizeRoute: () => void;
  handleSaveTour: () => void;
  editingTourId: string | null;
  setShowItinerary: (v: boolean) => void;
  setShowTourMenu: (v: boolean) => void;
  setShowSaved: (v: boolean) => void;
  setShowMyTours: (v: boolean) => void;
  setSelectedTour: (t: any) => void;
  setSelectedRestaurant: (r: Restaurant | null) => void;
  onBack: () => void;
  onFindRestaurants: () => void;
}

export const ItineraryPanel = ({
  tourStops, tourName, tourDescription, setTourDescription,
  tourTags, setTourTags, availableTags,
  isEditingName, setIsEditingName, tempName, setTempName,
  handleNameSave, handleNameCancel,
  moveStop, syncStopOrder, removeStop, handleRestaurantClick,
  optimizeRoute, handleSaveTour, editingTourId,
  setShowItinerary, setShowTourMenu, setShowSaved,
  setShowMyTours, setSelectedTour, setSelectedRestaurant,
  onBack, onFindRestaurants,
}: ItineraryPanelProps) => {
  const goBack = () => {
    onBack();
  };

  const toggleTag = (tag: string) => {
    setTourTags(tourTags.includes(tag) ? tourTags.filter((t) => t !== tag) : [...tourTags, tag]);
  };

  if (tourStops.length === 0) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="p-4">
          <button type="button" onClick={goBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ChevronLeft className="w-5 h-5" /><span>Back</span>
          </button>
        </div>
        <div className="flex-1 flex flex-col p-8 text-center items-center justify-center -mt-12">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your Itinerary is Empty</h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">
            Start exploring restaurants on the map or list and add them to build your tour!
          </p>
          <button
            onClick={onFindRestaurants}
            className="px-6 py-3 bg-[#FF6B35] text-white font-medium rounded-lg hover:bg-[#e55a2b] transition-colors shadow-lg shadow-orange-200"
          >
            Find Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 h-full flex flex-col">
      <div className="mb-4">
        <button type="button" onClick={goBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ChevronLeft className="w-5 h-5" /><span>Back</span>
        </button>

        {isEditingName ? (
          <div className="space-y-3 bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text" value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Tour Name"
                className="flex-1 px-3 py-2 border border-[#FF6B35] rounded-lg font-medium text-slate-800 outline-none"
                autoFocus
              />
            </div>
            <textarea
              value={tourDescription}
              onChange={(e) => setTourDescription(e.target.value)}
              placeholder="Add a description for your tour..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#FF6B35]"
              rows={3}
            />
            <div>
              <p className="text-xs text-gray-500 mb-2">Select Tags:</p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={'text-xs px-2 py-1 rounded-full transition-colors ' + (tourTags.includes(tag) ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={handleNameCancel} className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
              <button onClick={handleNameSave} className="px-3 py-1 bg-[#FF6B35] text-white rounded-lg text-sm hover:bg-[#e55a2b]">Save Details</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-2 group mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800">{tourName}</h3>
                {tourDescription && <p className="text-sm text-gray-600 mt-1">{tourDescription}</p>}
                {tourTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tourTags.map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => { setIsEditingName(true); setTempName(tourName || 'Untitled Tour'); }}
                className="p-2 text-gray-400 hover:text-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-2">
          <textarea
            value={tourDescription}
            onChange={(e) => setTourDescription(e.target.value)}
            placeholder="Add a description for your tour..."
            className="w-full px-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:border-[#FF6B35] outline-none resize-none"
            rows={2}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button key={tag} onClick={() => toggleTag(tag)}
              className={'px-3 py-1 rounded-full text-xs font-medium transition-colors ' + (tourTags.includes(tag) ? 'bg-[#FF6B35] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#FF6B35]')}>
              {tag}
            </button>
          ))}
        </div>
        <div className="flex gap-4 text-sm text-gray-500 mt-3 pb-3 border-b border-gray-200">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> ~{tourStops.length * 1.5}h</span>
          <span className="flex items-center gap-1"><Map className="w-4 h-4" /> {tourStops.length} stops</span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {tourStops.map((stop, index) => (
          <div key={stop.id} className="relative flex items-start gap-3">
            <div className="mt-5 w-2.5 h-2.5 rounded-full bg-[#FF6B35] ring-4 ring-white shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Stop {index + 1}</span>
              <DraggableStop stop={stop} index={index} moveStop={moveStop} syncStopOrder={syncStopOrder} removeStop={removeStop} onStopClick={handleRestaurantClick} />
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-[70px] bg-gray-50 pt-2 pb-2">
        <button
          onClick={onFindRestaurants}
          className="w-full py-3 bg-white border-2 border-[#FF6B35] text-[#FF6B35] rounded-lg font-medium hover:bg-[#FF6B35] hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Search className="w-4 h-4" /> Add More Restaurants
        </button>
      </div>
      <div className="flex gap-2 sticky bottom-0 bg-gray-50 pt-2 pb-4">
        <button onClick={optimizeRoute}
          className="flex-1 flex items-center justify-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 py-3 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
          <Sparkles className="w-4 h-4" /> Optimize Route
        </button>
        <button onClick={handleSaveTour}
          className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B35] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#e55a2b] transition-colors shadow-lg shadow-orange-200">
          <Save className="w-4 h-4" /> {editingTourId ? 'Update Tour' : 'Save Tour'}
        </button>
      </div>
    </div>
  );
};
