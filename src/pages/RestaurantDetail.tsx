import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Share2, Heart, CheckCircle, Wifi, Car, Utensils, Map } from 'lucide-react';
import { MOCK_RESTAURANTS } from '../lib/data';
import { MockMap } from '../components/MockMap';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurant = MOCK_RESTAURANTS.find(r => r.id === id) || MOCK_RESTAURANTS[0];

  const handleViewOnMap = () => {
    navigate('/planner', { state: { selectedRestaurant: restaurant } });
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Top Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 h-[300px] md:h-[400px] gap-1">
        <div className="md:col-span-2 h-full overflow-hidden relative group">
          <img src={restaurant.image} alt="Main" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>
        <div className="hidden md:block col-span-1 h-full overflow-hidden relative group">
          <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80" alt="Interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="hidden md:block col-span-1 h-full overflow-hidden relative group">
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" alt="Food" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/50 transition-colors">
            <span className="text-white font-bold border border-white px-4 py-2 rounded-full">View All Photos</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">{restaurant.name}</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                      <span className="text-lg">{restaurant.rating}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(restaurant.rating) ? 'fill-current' : 'text-gray-300'}`} />)}
                      </div>
                    </div>
                    <span className="text-gray-400">({restaurant.reviewCount} reviews)</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-medium text-slate-600">{restaurant.priceRange} - {restaurant.tags.join(', ')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full border border-gray-200 hover:border-red-500 hover:text-red-500 text-gray-500 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                {restaurant.openNow ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                    <CheckCircle className="w-4 h-4" /> Open Now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold">
                    Closed
                  </span>
                )}
                <span className="text-gray-500 text-sm">Closes at 10:00 PM</span>
              </div>

              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={handleViewOnMap}
                  className="flex-1 bg-[#FF6B35] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#e55a2b] transition-colors shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                >
                  <Map className="w-5 h-5" />
                  View on Map
                </button>
                <button className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:border-slate-800 hover:text-slate-900 transition-colors">
                  Write Review
                </button>
              </div>
            </div>

            {/* About Section */}
            {restaurant.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">About</h2>
                <p className="text-slate-600 leading-relaxed">{restaurant.description}</p>
              </div>
            )}

            {/* Signature Dishes */}
            {restaurant.dishes.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Must Try Dishes</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {restaurant.dishes.map(dish => (
                    <div key={dish.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden group">
                      <div className="h-32 overflow-hidden">
                        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-slate-800 text-sm mb-1">{dish.name}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-[#FF6B35] font-medium text-sm">{dish.price}</span>
                          {dish.isSignature && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">Signature</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Reviews</h2>
              <div className="space-y-6">
                {restaurant.reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{review.user}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex text-yellow-400"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
                          <span>• {review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{review.text}</p>
                  </div>
                ))}
                <button className="w-full py-3 text-slate-500 font-medium hover:text-[#FF6B35] text-sm">View all 1,204 reviews</button>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Map Widget */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden p-1">
                <div className="h-40 w-full rounded-lg overflow-hidden relative">
                  <MockMap className="w-full h-full" restaurants={[restaurant]} zoom={14} />
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{restaurant.address}</span>
                  </div>
                  <button className="w-full py-2 bg-blue-50 text-[#2E86AB] text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors" onClick={handleViewOnMap}>
                    Get Directions
                  </button>
                </div>
              </div>

              {/* Info Widget */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500"><Clock className="w-4 h-4" /> Mon-Fri</span>
                    <span className="font-medium">10:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500"><Clock className="w-4 h-4" /> Sat-Sun</span>
                    <span className="font-medium">9:00 AM - 11:00 PM</span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500"><Phone className="w-4 h-4" /> Phone</span>
                    <span className="font-medium text-[#2E86AB]">+84 90 123 4567</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.amenities.map(am => (
                    <span key={am} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-medium border border-gray-100">
                      {am}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};