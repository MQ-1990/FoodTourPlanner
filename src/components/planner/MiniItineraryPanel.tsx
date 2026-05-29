import { ChevronLeft, Clock, Map, MapPin } from 'lucide-react';
import { Restaurant } from '../../lib/data';

interface MiniItineraryPanelProps {
  tourStops: Restaurant[];
  setShowMiniItinerary: (v: boolean) => void;
  setShowItinerary: (v: boolean) => void;
}

export const MiniItineraryPanel = ({
  tourStops, setShowMiniItinerary, setShowItinerary,
}: MiniItineraryPanelProps) => (
  <div className="p-4">
    <button
      onClick={() => setShowMiniItinerary(false)}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
    >
      <ChevronLeft className="w-5 h-5" /><span>Back</span>
    </button>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Current Itinerary</h2>
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> ~{tourStops.length * 1.5}h</span>
      <span className="flex items-center gap-1"><Map className="w-4 h-4" /> {tourStops.length} stops</span>
    </div>
    {tourStops.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <p>Your itinerary is empty.</p>
        <button
          onClick={() => setShowMiniItinerary(false)}
          className="mt-4 text-[#FF6B35] font-medium hover:underline"
        >Add restaurants</button>
      </div>
    ) : (
      <div className="space-y-3 mb-6">
        {tourStops.map((stop, index) => (
          <div key={stop.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="w-6 h-6 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{stop.name}</h4>
            </div>
          </div>
        ))}
      </div>
    )}
    <button
      onClick={() => { setShowMiniItinerary(false); setShowItinerary(true); }}
      className="w-full bg-[#2E86AB] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#236B8A] transition-colors flex items-center justify-center gap-2"
    >
      <MapPin className="w-4 h-4" /> Go to Full Itinerary
    </button>
  </div>
);
