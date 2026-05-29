import { ChevronLeft, Clock, MapPin, Edit2, Trash2, FolderOpen } from 'lucide-react';

interface MyToursPanelProps {
  myTours: any[];
  setShowMyTours: (v: boolean) => void;
  setShowTourMenu: (v: boolean) => void;
  setPreviousView: (v: string) => void;
  setSelectedTour: (t: any) => void;
  handleEditMyTour: (t: any) => void;
  handleDeleteMyTour: (id: string) => void;
  handleRestaurantClick: (r: any) => void;
}

export const MyToursPanel = ({
  myTours, setShowMyTours, setShowTourMenu,
  setPreviousView, setSelectedTour,
  handleEditMyTour, handleDeleteMyTour, handleRestaurantClick,
}: MyToursPanelProps) => (
  <div className="p-4">
    <button
      onClick={() => { setShowMyTours(false); setShowTourMenu(true); }}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
    >
      <ChevronLeft className="w-5 h-5" /><span>Back</span>
    </button>
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900">My Tours</h2>
      <p className="text-sm text-gray-500 mt-1">You have {myTours.length} created tour{myTours.length !== 1 ? 's' : ''}</p>
    </div>

    {myTours.length === 0 ? (
      <div className="mt-12 text-center text-gray-500">
        <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="font-medium">No tours created yet</p>
        <p className="text-sm mt-2">Create a tour and save it to see it here</p>
      </div>
    ) : (
      <div className="space-y-3">
        {[...myTours]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((tour) => (
            <div
              key={tour.id}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-purple-500 transition-colors cursor-pointer"
              onClick={() => { setPreviousView('my-tours'); setSelectedTour(tour); setShowMyTours(false); setShowTourMenu(false); }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{tour.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(tour.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />{tour.stops.length} stops
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditMyTour(tour); }}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      title="Edit tour"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteMyTour(tour.id); }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete tour"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex -space-x-2 overflow-hidden py-1">
                  {tour.stops.slice(0, 5).map((stop: any, i: number) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-100 cursor-pointer hover:ring-[#FF6B35] transition-all"
                      title={stop.name}
                      onClick={(e) => { e.stopPropagation(); handleRestaurantClick(stop); }}
                    >
                      <img src={stop.image || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {tour.stops.length > 5 && (
                    <div className="w-8 h-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                      +{tour.stops.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    )}
  </div>
);
