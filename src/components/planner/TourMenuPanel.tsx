import { ChevronLeft, ChevronRight, MapPin, FolderOpen, Bookmark } from 'lucide-react';

interface TourMenuPanelProps {
  tourStops: any[];
  myTours: any[];
  savedTours: any[];
  setShowTourMenu: (v: boolean) => void;
  setShowSearchMenu: (v: boolean) => void;
  setShowItinerary: (v: boolean) => void;
  setShowMiniItinerary: (v: boolean) => void;
  setShowMyTours: (v: boolean) => void;
  setShowSaved: (v: boolean) => void;
  setSavedCategory: (v: string | null) => void;
}

export const TourMenuPanel = ({
  tourStops, myTours, savedTours,
  setShowTourMenu, setShowSearchMenu,
  setShowItinerary, setShowMiniItinerary,
  setShowMyTours, setShowSaved, setSavedCategory,
}: TourMenuPanelProps) => (
  <div className="p-4">
    <button
      onClick={() => { setShowTourMenu(false); setShowSearchMenu(true); }}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
    >
      <ChevronLeft className="w-5 h-5" /><span>Back</span>
    </button>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Tour</h2>

    {/* Current Itinerary */}
    <div className="mb-6">
      <button
        onClick={() => { setShowTourMenu(false); setShowItinerary(true); setShowMiniItinerary(false); }}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#2E86AB]/10 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[#2E86AB]" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-900">Current Itinerary</h3>
            <p className="text-sm text-gray-500">
              {tourStops.length > 0 ? tourStops.length + ' stop' + (tourStops.length !== 1 ? 's' : '') + ' • Active' : 'Empty'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
      </button>
    </div>

    {/* My Tours */}
    <div className="mb-6">
      <button
        onClick={() => { setShowTourMenu(false); setShowMyTours(true); }}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-purple-500" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-900">My Tours</h3>
            <p className="text-sm text-gray-500">Private • {myTours.length} created</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
      </button>
    </div>

    {/* Saved Tours */}
    <div>
      <button
        onClick={() => { setShowTourMenu(false); setShowSaved(true); setSavedCategory('tours'); }}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-teal-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-900">Saved Tours</h3>
            <p className="text-sm text-gray-500">Public • {savedTours.length} saved</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
      </button>
    </div>
  </div>
);
