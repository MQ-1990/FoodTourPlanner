import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Star, User, Calendar, Play, Edit, Bookmark, Share2 } from 'lucide-react';
import { tours } from '../data/mockData';
import { MOCK_RESTAURANTS } from '../lib/data';
import { MockMap } from '../components/MockMap';

export const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const tour = tours.find(t => t.id === id);

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Tour Not Found</h2>
          <Link to="/" className="text-[#FF6B35] hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  // Mock tour data - use first restaurants as tour stops
  const tourStops = MOCK_RESTAURANTS.slice(0, tour.stops);
  
  const creator = {
    name: "Alex Nguyen",
    avatar: "https://i.pravatar.cc/150?u=creator",
    tours: 12
  };

  const handleStartTour = () => {
    // Load this tour into the planner
    navigate('/planner', { state: { tour } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={tour.image} 
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1 text-white text-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {tour.rating}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-3">{tour.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-white/90 text-sm mb-4">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {tour.duration}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {tour.distance}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {tour.stops} stops
              </span>
            </div>

            {/* Creator Info */}
            <div className="flex items-center gap-3">
              <img 
                src={creator.avatar} 
                alt={creator.name}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div>
                <p className="text-white font-medium">{creator.name}</p>
                <p className="text-white/70 text-xs">{creator.tours} tours created</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-3">
            <button 
              onClick={handleStartTour}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#e55a2b] transition-colors"
            >
              <Play className="w-4 h-4" /> Start This Tour
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-200 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Bookmark className="w-4 h-4" /> Save
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-200 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4">About This Tour</h2>
              <p className="text-gray-600 leading-relaxed">
                Experience the authentic flavors of the city with this carefully curated food tour. 
                Each stop has been selected to showcase the best local cuisine, from hidden gems 
                known only to locals to iconic establishments that define our culinary scene.
              </p>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {['Street Food', 'Local Favorites', 'Budget Friendly', 'Photo Worthy'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-orange-50 text-[#FF6B35] rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Tour Stops */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Tour Stops ({tour.stops})</h2>
              
              <div className="space-y-0 relative">
                {/* Connecting Line */}
                <div className="absolute left-[15px] top-8 bottom-8 w-0.5 bg-gray-200 z-0" />

                {tourStops.map((stop, index) => (
                  <div key={stop.id} className="relative z-10 flex items-start gap-4 pb-6">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-bold text-sm ring-4 ring-white">
                        {index + 1}
                      </div>
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                          <img src={stop.image} alt={stop.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/restaurant/${stop.id}`}
                            className="font-bold text-slate-800 hover:text-[#FF6B35] mb-1 block"
                          >
                            {stop.name}
                          </Link>
                          <p className="text-sm text-gray-500 mb-2">{stop.address}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {stop.rating}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">{stop.priceRange}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 shrink-0">
                          ~1 hr
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Map Preview */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-3">Route Map</h3>
                <div className="h-64 rounded-lg overflow-hidden">
                  <MockMap 
                    restaurants={tourStops}
                    path={tourStops.map(s => ({ x: s.lat, y: s.lng }))}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Tour Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-slate-800">{tour.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Distance</span>
                    <span className="font-medium text-slate-800">{tour.distance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stops</span>
                    <span className="font-medium text-slate-800">{tour.stops} restaurants</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Difficulty</span>
                    <span className="font-medium text-slate-800">Easy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
