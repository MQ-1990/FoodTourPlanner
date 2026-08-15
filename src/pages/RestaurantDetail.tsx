import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Share2, Heart, CheckCircle, Map } from 'lucide-react';
import { useRestaurants } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import { MockMap } from '../components/MockMap';
import api from '../lib/api';

interface ApiReview {
  _id: string;
  rating: number;
  content: string;
  createdAt: string;
  user?: {
    _id?: string;
    username?: string;
    email?: string;
    avatar?: string;
  };
}

export const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { restaurants } = useRestaurants();
  const { isAuthenticated } = useAuth();
  const restaurant = restaurants.find((r) => String(r.id) === id) || restaurants[0];

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const fetchReviews = async () => {
    if (!restaurant?.id) return;

    setIsLoadingReviews(true);
    try {
      const res = await api.get(`/restaurants/${restaurant.id}/reviews`);
      setReviews(res.data || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [restaurant?.id]);

  useEffect(() => {
    const fetchProfileFavorites = async () => {
      if (!isAuthenticated) {
        setFavoriteIds([]);
        return;
      }

      try {
        const res = await api.get('/users/me');
        setFavoriteIds(Array.isArray(res.data?.favorites) ? res.data.favorites : []);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
        setFavoriteIds([]);
      }
    };

    fetchProfileFavorites();
  }, [isAuthenticated]);

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading restaurant...</p>
      </div>
    );
  }

  const handleViewOnMap = () => {
    navigate('/planner', { state: { selectedRestaurant: restaurant } });
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!reviewContent.trim()) return;

    setIsSubmittingReview(true);
    try {
      await api.post(`/restaurants/${restaurant.id}/reviews`, {
        rating: reviewRating,
        content: reviewContent.trim(),
      });
      setReviewContent('');
      setReviewRating(5);
      await fetchReviews();
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      alert(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isFavorite = favoriteIds.includes(Number(restaurant.id));

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/users/me/favorites/${restaurant.id}`);
        setFavoriteIds((prev) => prev.filter((favoriteId) => favoriteId !== Number(restaurant.id)));
      } else {
        const res = await api.post('/users/me/favorites', { rid: Number(restaurant.id) });
        setFavoriteIds(Array.isArray(res.data?.favorites) ? res.data.favorites : [...favoriteIds, Number(restaurant.id)]);
      }
    } catch (err: any) {
      console.error('Failed to update favorite:', err);
      alert(err?.response?.data?.message || 'Failed to update favorite');
    }
  };

  const displayedReviewCount = reviews.length || restaurant.reviewCount || 0;

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="grid grid-cols-1 md:grid-cols-4 h-[300px] md:h-[400px] gap-1">
        <div className="md:col-span-2 h-full overflow-hidden relative group">
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">{restaurant.name}</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                      <span className="text-lg">{restaurant.rating}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${star <= Math.round(restaurant.rating) ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-gray-400">({displayedReviewCount} reviews)</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-medium text-slate-600">{restaurant.priceRange} - {restaurant.tags.join(', ')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-2 rounded-full border transition-colors ${isFavorite ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-200 hover:border-red-500 hover:text-red-500 text-gray-500'}`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
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
                <span className="text-gray-500 text-sm">
                  {restaurant.openingTime && restaurant.closingTime ? `${restaurant.openingTime} - ${restaurant.closingTime}` : 'Opening hours unavailable'}
                </span>
              </div>

              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={handleViewOnMap}
                  className="flex-1 bg-[#FF6B35] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#e55a2b] transition-colors shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                >
                  <Map className="w-5 h-5" />
                  View on Map
                </button>
                <button
                  onClick={() => document.getElementById('reviewForm')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:border-slate-800 hover:text-slate-900 transition-colors"
                >
                  Write Review
                </button>
              </div>
            </div>

            {restaurant.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">About</h2>
                <p className="text-slate-600 leading-relaxed">{restaurant.description}</p>
              </div>
            )}

            {restaurant.dishes.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Must Try Dishes</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {restaurant.dishes.map((dish) => (
                    <div key={dish.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden group">
                      <div className="h-32 overflow-hidden">
                        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-slate-800 text-sm mb-1">{dish.name}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-[#FF6B35] font-medium text-sm">{dish.price} VND</span>
                          {dish.isSignature && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">Signature</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Reviews</h2>
              <div id="reviewForm" className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="font-bold text-slate-800">Write a review</h3>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm outline-none"
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>{rating} stars</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  rows={3}
                  placeholder={isAuthenticated ? 'Share your experience...' : 'Login to write a review'}
                  disabled={!isAuthenticated}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:bg-gray-100"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={!isAuthenticated || isSubmittingReview || !reviewContent.trim()}
                  className="mt-3 bg-[#FF6B35] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#e55a2b] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmittingReview ? 'Submitting...' : isAuthenticated ? 'Submit Review' : 'Login to Review'}
                </button>
              </div>

              <div className="space-y-6">
                {isLoadingReviews && <p className="text-sm text-gray-500">Loading reviews...</p>}
                {!isLoadingReviews && reviews.length === 0 && (
                  <p className="text-sm text-gray-500">No reviews yet.</p>
                )}
                {reviews.map((review) => {
                  const reviewUser = review.user?.username || review.user?.email || 'Anonymous';
                  const reviewAvatar = review.user?.avatar || `https://i.pravatar.cc/150?u=${review.user?._id || review._id}`;

                  return (
                    <div key={review._id} className="border-b border-gray-100 pb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={reviewAvatar} alt={reviewUser} className="w-10 h-10 rounded-full" />
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{reviewUser}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="flex text-yellow-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span>- {new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{review.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-6">
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

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500"><Clock className="w-4 h-4" /> Opening Hours</span>
                    <span className="font-medium">
                      {restaurant.openingTime && restaurant.closingTime
                        ? `${restaurant.openingTime} - ${restaurant.closingTime}`
                        : 'N/A'}
                    </span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500"><Phone className="w-4 h-4" /> Phone</span>
                    <span className="font-medium text-[#2E86AB]">{restaurant.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {restaurant.amenities.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-bold text-slate-800 mb-4">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.amenities.map((amenity) => (
                      <span key={amenity} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-medium border border-gray-100">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
