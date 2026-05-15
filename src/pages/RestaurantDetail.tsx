import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Share2, Heart, CheckCircle, Map } from 'lucide-react';
import { MOCK_RESTAURANTS } from '../lib/data';
// import { MockMap } from '../components/MockMap';
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

const API_URL = 'http://localhost:5000';

// ==== TYPES (match với BE) ====

type Dish = {
  id: number;
  name: string;
  price: string;
  image: string;
  isSignature?: boolean;
};

type Review = {
  _id: string;
  rating: number;
  content: string;
  createdAt: string;
  user: {
    _id: string;
    username?: string;
    email?: string;
    avatar?: string;
  };
};

type Restaurant = {
  _id?: string;
  id: number;
  name: string;
  rating: number;
  priceRange: string;
  address?: string;
  district?: string;
  tags: string[];
  image?: string;
  openingTime?: string;   // "09:00"
  closingTime?: string;   // "22:00"
  description?: string;
  phone?: string;
  lat: number;
  lng: number;

  dishes: Dish[];
  reviews?: any[];
  amenities?: string[];
  openNow?: boolean;
  reviewCount?: number;
};

const buildGoogleMapEmbedUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

const buildGoogleMapDirectionsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

// === helper: tính đang mở cửa hay không từ openingTime / closingTime ===
const getIsOpenNow = (openingTime?: string, closingTime?: string): boolean | null => {
  if (!openingTime || !closingTime) return null;

  const [openH, openM] = openingTime.split(':').map(Number);
  const [closeH, closeM] = closingTime.split(':').map(Number);

  if (
    Number.isNaN(openH) ||
    Number.isNaN(openM) ||
    Number.isNaN(closeH) ||
    Number.isNaN(closeM)
  ) return null;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  // mở & đóng trong cùng ngày
  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }
  // mở qua đêm
  return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
};

export const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [openReview, setOpenReview] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bannerMode, setBannerMode] = useState<"grid" | "strip">("grid");
  const stripRef = React.useRef<HTMLDivElement | null>(null);
  const handleWheelToHorizontal = (e: React.WheelEvent<HTMLDivElement>) => {
    // chỉ xử lý khi đang ở strip
    if (bannerMode !== "strip") return;

    const el = stripRef.current;
    if (!el) return;

    // nếu user đang kéo ngang trackpad (deltaX) thì để browser xử lý luôn
    const isMostlyVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);

    if (isMostlyVertical) {
      e.preventDefault(); // chặn scroll dọc trang
      el.scrollLeft += e.deltaY; // lăn dọc => kéo ngang
    }
  };


  // ✅ Favorites state
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  type JwtPayload = { id: string; email?: string; role?: string };

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    "";

  const myUserId = (() => {
    if (!token) return null;
    try {
      return jwtDecode<JwtPayload>(token).id;
    } catch {
      return null;
    }
  })();

  // ===== GALLERY =====
  const photos = useMemo(() => {
    const arr = [
      restaurant?.image,
      ...(restaurant?.dishes?.map((d) => d.image).filter(Boolean) || []),
    ].filter(Boolean) as string[];

    // loại trùng (nếu có)
    return Array.from(new Set(arr));
  }, [restaurant]);

  const [showGallery, setShowGallery] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openGallery = (startIndex = 0) => {
    if (!photos.length) return;
    setActiveIndex(startIndex);
    setShowGallery(true);
  };

  const closeGallery = () => setShowGallery(false);

  // ESC + khóa scroll body khi mở
  useEffect(() => {
    if (!showGallery) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGallery();
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i - 1 + photos.length) % photos.length);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [showGallery, photos.length]);


  // ✅ fetch favorites from /me
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) return setFavoriteIds([]);
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return setFavoriteIds([]);
        const data = await res.json();
        setFavoriteIds(Array.isArray(data.favorites) ? data.favorites : []);
      } catch {
        setFavoriteIds([]);
      }
    };
    fetchMe();
  }, [token]);

  // ✅ toggle favorite (POST/DELETE)
  const toggleFavorite = async (rid: number) => {
    if (!token) {
      toast.error("Please login to save favorites");
      return;
    }

    const isFav = favoriteIds.includes(rid);

    // optimistic UI
    setFavoriteIds((prev) => (isFav ? prev.filter((x) => x !== rid) : [...prev, rid]));

    try {
      if (!isFav) {
        const res = await fetch(`${API_URL}/api/users/me/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rid }),
        });
        if (!res.ok) throw new Error("add favorite failed");
        toast.success("Added to favorites");
      } else {
        const res = await fetch(`${API_URL}/api/users/me/favorites/${rid}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("remove favorite failed");
        toast.success("Removed from favorites");
      }
    } catch {
      // rollback
      setFavoriteIds((prev) => (isFav ? [...prev, rid] : prev.filter((x) => x !== rid)));
      toast.error("Update favorite failed");
    }
  };

  // ==== FETCH RESTAURANT TỪ BE ====
  useEffect(() => {
    if (!id) return;

    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/restaurants/${id}`);
        if (!res.ok) throw new Error('Cannot fetch restaurant');
        const data: Restaurant = await res.json();
        setRestaurant(data);
      } catch (err) {
        console.error('Không lấy được restaurant từ BE, dùng mock.', err);
        const fallback =
          MOCK_RESTAURANTS.find((r) => String(r.id) === String(id)) ||
          MOCK_RESTAURANTS[0];
        setRestaurant(fallback as any);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  // ==== FETCH REVIEWS ====
  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await fetch(`${API_URL}/api/restaurants/${id}/reviews`);
        if (!res.ok) throw new Error("Cannot fetch reviews");
        const data: Review[] = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Không lấy được reviews", err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);
  const formattedAddress = useMemo(() => {
    if (!restaurant) return "";

    let districtLabel = restaurant.district;

    if (districtLabel && /^\d+$/.test(districtLabel)) {
      districtLabel = `Quận ${districtLabel}`;
    }

    return restaurant.address && districtLabel
      ? `${restaurant.address}, ${districtLabel}`
      : restaurant.address || "";
  }, [restaurant]);

  const handleViewOnMap = () => {
    if (!restaurant) return;
    navigate('/planner', { state: { selectedRestaurant: restaurant } });
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!id) return;

    const ok = window.confirm("Delete this review?");
    if (!ok) return;

    if (!token) {
      alert("Please login");
      return;
    }

    const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(payload?.message || "Cannot delete review");
      return;
    }

    // refresh list
    const res2 = await fetch(`${API_URL}/api/restaurants/${id}/reviews`);
    const data: Review[] = await res2.json();
    setReviews(data);
  };

  const isFavThisRestaurant = useMemo(() => {
    if (!restaurant) return false;
    return favoriteIds.includes(restaurant.id);
  }, [favoriteIds, restaurant]);

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading restaurant...</p>
      </div>
    );
  }

  const reviewCount = reviews.length || restaurant.reviewCount || 0;
  const isOpenComputed = getIsOpenNow(restaurant.openingTime, restaurant.closingTime);
  const amenities = restaurant.amenities ?? [];
  const dishImages = restaurant.dishes?.map((d) => d.image).filter(Boolean) ?? [];

  const sideImage1 = dishImages[0] || restaurant.image;
  const sideImage2 = dishImages[1] || dishImages[0] || restaurant.image;
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);



  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Top Banner Grid */}
      {/* Top Banner */}
      {bannerMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 h-[300px] md:h-[400px] gap-1">
          <div className="md:col-span-2 h-full overflow-hidden relative group">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          <div className="hidden md:block col-span-1 h-full overflow-hidden relative group">
            <img
              src={sideImage1}
              alt={`${restaurant.name} dish`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          <div className="hidden md:block col-span-1 h-full overflow-hidden relative group">
            <img
              src={sideImage2}
              alt={`${restaurant.name} dish`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/50 transition-colors"
              onClick={() => setBannerMode("strip")}
            >
              <span className="text-white font-bold border border-white px-4 py-2 rounded-full">
                View All Photos
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* strip container */}
          <div
            ref={stripRef}
            onWheel={handleWheelToHorizontal}
            className="
        w-full h-[300px] md:h-[400px]
        overflow-x-auto overflow-y-hidden
        whitespace-nowrap
        scroll-smooth
      "
            style={{
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
            }}
          >
            <div className="flex h-full gap-2 px-2">
              {photos.map((src, idx) => (
                <div
                  key={src + idx}
                  className="h-full flex-shrink-0 rounded-xl overflow-hidden"
                  style={{ width: "min(70vw, 520px)" }} // mỗi ảnh to vừa phải
                >
                  <img
                    src={src}
                    alt={`banner-${idx}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* nút quay lại grid */}
          <button
            type="button"
            onClick={() => setBannerMode("grid")}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/55 text-white text-sm font-bold px-4 py-2 rounded-full"
          >
            Back
          </button>

          {/* hint nhỏ */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/35 text-white/90 text-xs px-3 py-1 rounded-full">
            Hover & scroll to view more photos
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                    {restaurant.name}
                  </h1>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                      <span className="text-lg">{restaurant.rating?.toFixed(1) ?? '0.0'}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= Math.round(restaurant.rating || 0) ? 'fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-gray-400">({reviewCount} reviews)</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-medium text-slate-600">
                      {restaurant.priceRange}{' '}
                      {restaurant.tags?.length ? `- ${restaurant.tags.join(', ')}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500">
                    <Share2 className="w-5 h-5" />
                  </button>

                  {/* ✅ FAVORITE BUTTON */}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(restaurant.id)}
                    className={`p-2 rounded-full border transition-colors
                      ${isFavThisRestaurant
                        ? "border-red-500 text-red-500 bg-red-50"
                        : "border-gray-200 text-gray-500 hover:border-red-500 hover:text-red-500"
                      }`}
                    title={isFavThisRestaurant ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={`w-5 h-5 ${isFavThisRestaurant ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                {isOpenComputed !== null && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold
                      ${isOpenComputed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isOpenComputed ? 'Open Now' : 'Closed'}
                  </span>
                )}

                {restaurant.openingTime && restaurant.closingTime && (
                  <span className="text-gray-500 text-sm">
                    {isOpenComputed === null
                      ? `Hours: ${restaurant.openingTime} - ${restaurant.closingTime}`
                      : isOpenComputed
                        ? `Closes at ${restaurant.closingTime}`
                        : `Opens at ${restaurant.openingTime}`}
                  </span>
                )}
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
                  onClick={() => setOpenReview(true)}
                  className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:border-slate-800 hover:text-slate-900 transition-colors"
                >
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
            {!!restaurant.dishes?.length && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Must Try Dishes</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {restaurant.dishes.map((dish) => (
                    <div key={dish.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden group">
                      <div className="h-32 overflow-hidden">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-slate-800 text-sm mb-1">{dish.name}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-[#FF6B35] font-medium text-sm">{dish.price}</span>
                          {dish.isSignature && (
                            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">
                              Signature
                            </span>
                          )}
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
                {reviewsLoading ? (
                  <p className="text-gray-500">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-gray-400 text-sm">No reviews yet.</p>
                ) : (
                  visibleReviews.map((review) => {
                    const name = review.user?.username || review.user?.email || "Anonymous";
                    const dateStr = review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : "";

                    return (
                      <div key={review._id} className="border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-3 mb-3">
                          {review.user?.avatar ? (
                            <img src={review.user.avatar} alt={name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-bold">
                              {name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm">{name}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${i <= review.rating ? "fill-current" : "text-gray-300"}`}
                                      />
                                    ))}
                                  </div>
                                  {dateStr && <span>• {dateStr}</span>}
                                </div>
                              </div>

                              {myUserId && review.user?._id === myUserId && (
                                <button
                                  onClick={() => handleDeleteReview(review._id)}
                                  className="text-xs font-bold text-red-500 hover:text-red-600"
                                  title="Delete this review"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-slate-600 text-sm leading-relaxed">{review.content}</p>
                      </div>
                    );
                  })
                )}

                {reviewCount > 3 && (
                  <button
                    className="w-full py-3 text-slate-500 font-medium hover:text-[#FF6B35] text-sm"
                    onClick={() => setShowAllReviews((v) => !v)}
                  >
                    {showAllReviews ? "Show less" : `View all ${reviewCount.toLocaleString()} reviews`}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Map Widget */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden p-1">
                <div className="h-40 w-full rounded-lg overflow-hidden relative">
                  <iframe
                    title="map"
                    src={buildGoogleMapEmbedUrl(restaurant.lat, restaurant.lng)}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{formattedAddress}</span>
                  </div>
                  <button
                    className="w-full py-2 bg-blue-50 text-[#2E86AB] text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors"
                    onClick={() => window.open(buildGoogleMapDirectionsUrl(restaurant.lat, restaurant.lng), "_blank")}
                  >
                    Get Directions
                  </button>
                </div>
              </div>

              {/* Info Widget */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" /> Opening hours
                    </span>
                    <span className="font-medium">
                      {restaurant.openingTime && restaurant.closingTime
                        ? `${restaurant.openingTime} - ${restaurant.closingTime}`
                        : 'Not provided'}
                    </span>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Phone className="w-4 h-4" /> Phone
                    </span>
                    <span className="font-medium text-[#2E86AB]">
                      {restaurant.phone || '+84 90 123 4567'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((am) => (
                    <span
                      key={am}
                      className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-medium border border-gray-100"
                    >
                      {am}
                    </span>
                  ))}
                  {!amenities.length && (
                    <span className="text-xs text-gray-400">No amenities listed.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== REVIEW MODAL ===== */}
      {openReview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[92%] max-w-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Write a review</h3>
              <button onClick={() => setOpenReview(false)} className="text-gray-500 hover:text-gray-800">
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Rating</p>
              <div className="flex gap-1 text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button type="button" key={i} onClick={() => setNewRating(i)} className="p-1">
                    <Star className={`w-6 h-6 ${i <= newRating ? "fill-current" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Your review</p>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                rows={4}
                placeholder="Write something..."
              />
            </div>

            <button
              disabled={submitting || !newContent.trim()}
              onClick={async () => {
                if (!id) return;
                if (!token) {
                  alert("Please login to write a review");
                  return;
                }

                try {
                  setSubmitting(true);

                  const res = await fetch(`${API_URL}/api/restaurants/${id}/reviews`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      rating: newRating,
                      content: newContent,
                    }),
                  });

                  const payload = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    alert(payload?.message || "Cannot create review");
                    return;
                  }

                  const res2 = await fetch(`${API_URL}/api/restaurants/${id}/reviews`);
                  const data: Review[] = await res2.json();
                  setReviews(data);

                  setNewContent("");
                  setNewRating(5);
                  setOpenReview(false);
                } finally {
                  setSubmitting(false);
                }
              }}
              className="w-full bg-[#FF6B35] text-white font-bold py-3 rounded-lg disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit review"}
            </button>
          </div>
        </div>
      )}
      {/* ===== END REVIEW MODAL ===== */}
      {/* ===== GALLERY MODAL (LIST ONLY) ===== */}
      {showGallery && (
        <div
          className="fixed inset-0 z-[60] bg-black/80"
          onClick={closeGallery}
          role="dialog"
          aria-modal="true"
        >
          {/* Header / Close */}
          <div
            className="absolute top-4 right-4 z-[61]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeGallery}
              className="text-white/90 hover:text-white text-3xl font-bold leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div
            className="h-full w-full flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-6xl h-full px-4 py-16 overflow-y-auto">
              {/* List ảnh (chỉ ảnh thôi) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((src, idx) => (
                  <div
                    key={src + idx}
                    className="rounded-xl overflow-hidden bg-black/20 border border-white/10"
                  >
                    <img
                      src={src}
                      alt={`photo-${idx}`}
                      className="w-full h-40 sm:h-48 lg:h-56 object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ===== END GALLERY MODAL ===== */}

    </div>
  );
};
