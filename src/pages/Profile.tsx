import React, { FormEvent, useEffect, useState } from 'react';
import { Settings, Map, Heart, Edit2, Check, X, Phone, MapPin, Store, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { TourCard } from '../components/TourCard';
import { RestaurantCard } from '../components/RestaurantCard';
import { useRestaurants } from '../context/RestaurantContext';
import * as Tabs from '@radix-ui/react-tabs';
import { toast } from 'sonner';
import api from '../lib/api';
import { AddressFields, addressPartsFromLegacy, createEmptyAddressParts, createVietnamAddressParts, formatAddress, type AddressParts } from '../components/AddressFields';

interface ProfileUser {
  _id: string;
  email: string;
  username?: string;
  phone?: string | null;
  address?: string;
  streetAddress?: string;
  ward?: string;
  district?: string;
  city?: string;
  country?: string;
  avatar?: string | null;
  taste_profile?: string[];
  preferred_area?: string;
  preferred_city_code?: string;
  preferred_district_code?: string;
  price_range?: string;
  favorites?: number[];
}

interface ProfileTour {
  id: string;
  title: string;
  image: string;
  duration: string;
  distance: string;
  stops: number;
  rating: number;
  createdAt?: string;
}

interface RestaurantRequest {
  _id: string;
  name: string;
  address: string;
  cuisine?: string;
  openingTime?: string;
  closingTime?: string;
  dishes?: SuggestedDish[];
  tags?: string[];
  image?: string | null;
  description?: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNote?: string | null;
  createdAt: string;
}

interface SuggestedDish {
  name: string;
  price: string;
  image?: string;
}

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?u=a042581f4e29026024d';
const DEFAULT_BIO = 'Foodie - Explorer - Coffee Addict';
const DEFAULT_ADDRESS = 'District 1, Ho Chi Minh City';

export const Profile = () => {
  const location = useLocation();
  const { restaurants: allRestaurants } = useRestaurants();
  const availableRestaurantTags = (() => {
    const tags = new globalThis.Map<string, string>();
    allRestaurants.flatMap((restaurant) => restaurant.tags ?? []).forEach((tag) => {
      const trimmed = tag?.trim();
      if (trimmed && !tags.has(trimmed.toLocaleLowerCase())) tags.set(trimmed.toLocaleLowerCase(), trimmed);
    });
    return [...tags.values()].sort((a, b) => a.localeCompare(b));
  })();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState(DEFAULT_BIO);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [myTours, setMyTours] = useState<ProfileTour[]>([]);
  const [restaurantRequests, setRestaurantRequests] = useState<RestaurantRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [activeProfileTab, setActiveProfileTab] = useState(location.state?.profileTab === 'submissions' ? 'submissions' : 'tours');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [requestAddressParts, setRequestAddressParts] = useState<AddressParts>(createVietnamAddressParts);
  const [requestAmenities, setRequestAmenities] = useState('');
  const [requestTags, setRequestTags] = useState<string[]>([]);
  const [requestTagDraft, setRequestTagDraft] = useState('');
  const [requestImage, setRequestImage] = useState('');
  const [requestImagePreview, setRequestImagePreview] = useState('');
  const [isUploadingRequestImage, setIsUploadingRequestImage] = useState(false);
  const [showRequestRestaurantImageOptions, setShowRequestRestaurantImageOptions] = useState(false);
  const [activeRequestDishImageOptions, setActiveRequestDishImageOptions] = useState<number | null>(null);
  const [requestDescription, setRequestDescription] = useState('');
  const [requestOpeningTime, setRequestOpeningTime] = useState('');
  const [requestClosingTime, setRequestClosingTime] = useState('');
  const [requestDishes, setRequestDishes] = useState<SuggestedDish[]>([{ name: '', price: '' }]);
  const requestAddress = formatAddress(requestAddressParts);

  const [tempName, setTempName] = useState('');
  const [tempBio, setTempBio] = useState(DEFAULT_BIO);
  const [tempPhone, setTempPhone] = useState('');
  const [profileAddressParts, setProfileAddressParts] = useState<AddressParts>(createEmptyAddressParts);
  const tempAddress = formatAddress(profileAddressParts);
  const [tempAvatar, setTempAvatar] = useState(DEFAULT_AVATAR);
  const [tempTasteProfile, setTempTasteProfile] = useState<string[]>([]);

  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(() => {
    const saved = localStorage.getItem('userTastePreferences');
    return saved ? JSON.parse(saved) : ["Any"];
  });
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('ho-chi-minh');
  const [selectedArea, setSelectedArea] = useState(DEFAULT_ADDRESS);

  const preferences = ['Spicy', 'Sweet', 'Seafood', 'Coffee', 'Milk Tea', 'Vegetarian', 'BBQ', 'Pho', 'Noodles'];
  const priceRanges = [
    { value: '', label: 'Any budget' },
    { value: '$', label: '< 50,000 VND' },
    { value: '$$', label: '50,000 - 100,000 VND' },
    { value: '$$$', label: '100,000 - 300,000 VND' },
    { value: '$$$$', label: '300,000 - 500,000 VND' },
    { value: '$$$$$', label: '> 500,000 VND' },
  ];
  const areaOptions = [
    // Thành phố Thủ Đức
    "Thu Duc City, Ho Chi Minh City",

    // Quận trung tâm
    "District 1, Ho Chi Minh City",
    "District 3, Ho Chi Minh City",
    "District 4, Ho Chi Minh City",
    "District 5, Ho Chi Minh City",
    "District 6, Ho Chi Minh City",
    "District 8, Ho Chi Minh City",
    "District 10, Ho Chi Minh City",
    "District 11, Ho Chi Minh City",

    // Khu Đông
    "District 2, Ho Chi Minh City",
    "District 9, Ho Chi Minh City",

    // Khu Bắc
    "District 12, Ho Chi Minh City",
    "Go Vap District, Ho Chi Minh City",
    "Tan Binh District, Ho Chi Minh City",
    "Tan Phu District, Ho Chi Minh City",

    // Khu Tây
    "Binh Tan District, Ho Chi Minh City",
    "Binh Chanh District, Ho Chi Minh City",

    // Khu Nam
    "District 7, Ho Chi Minh City",
    "Nha Be District, Ho Chi Minh City",
    "Can Gio District, Ho Chi Minh City",

    // Khu nội thành khác
    "Binh Thanh District, Ho Chi Minh City",
    "Phu Nhuan District, Ho Chi Minh City",

    // Huyện ngoại thành
    "Hoc Mon District, Ho Chi Minh City",
    "Cu Chi District, Ho Chi Minh City",
  ];
  const cities = [
    { value: 'ho-chi-minh', label: 'Ho Chi Minh City' },
    { value: 'ha-noi', label: 'Ha Noi' },
    { value: 'da-nang', label: 'Da Nang' },
  ];


  const normalizeTour = (tour: any): ProfileTour => {
    const stops = Array.isArray(tour.restaurants) ? tour.restaurants.length : 0;
    const firstRestaurant = Array.isArray(tour.restaurants)
      ? tour.restaurants.find((item: any) => item?.restaurant)?.restaurant
      : null;

    return {
      id: String(tour._id ?? tour.id),
      title: tour.name || tour.title || 'Untitled Tour',
      image: firstRestaurant?.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=60',
      duration: tour.totalTime ? `${Math.round(tour.totalTime)} min` : `${(stops * 1.5).toFixed(1)} hours`,
      distance: tour.totalDistance ? `${tour.totalDistance.toFixed(1)} km` : 'N/A',
      stops,
      rating: tour.rating || 0,
      createdAt: tour.createdAt,
    };
  };

  const applyProfile = (profile: ProfileUser) => {
    const displayName = profile.username || profile.email || '';
    const displayPhone = profile.phone || '';
    const displayAvatar = profile.avatar || DEFAULT_AVATAR;
    const tastes =
      Array.isArray(profile.taste_profile) &&
      profile.taste_profile.length
        ? profile.taste_profile
        : ["Any"];

    setName(displayName);
    setEmail(profile.email || '');
    setPhone(displayPhone);
    setAddress(profile.address || '');
    setProfileAddressParts(profile.streetAddress || profile.district || profile.city
      ? {
        streetAddress: profile.streetAddress || '',
        ward: profile.ward || '',
        district: profile.district || '',
        city: profile.city || '',
        country: profile.country || '',
      }
      : profile.address ? addressPartsFromLegacy(profile.address) : createEmptyAddressParts());
    setAvatar(displayAvatar);
    setTempName(displayName);
    setTempPhone(displayPhone);
    setTempAvatar(displayAvatar);
    setFavoriteIds(Array.isArray(profile.favorites) ? profile.favorites : []);

    setSelectedPreferences(tastes);
    setTempTasteProfile(tastes);
    localStorage.setItem('userTastePreferences', JSON.stringify(tastes));
    setSelectedArea(profile.preferred_area || DEFAULT_ADDRESS);
    setSelectedCityCode(profile.preferred_city_code || 'ho-chi-minh');
    setSelectedPriceRange(profile.price_range || '');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, toursRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/tours'),
        ]);
        applyProfile(profileRes.data);
        setMyTours((toursRes.data || []).map(normalizeTour));
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        toast.error(err?.response?.data?.message || 'Failed to load profile');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleRequestImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller.');
      return;
    }

    setRequestImagePreview(URL.createObjectURL(file));
    setIsUploadingRequestImage(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await api.post('/upload/local', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRequestImage(response.data.imageUrl);
    } catch (error: any) {
      setRequestImagePreview('');
      toast.error(error?.response?.data?.message || 'Unable to upload this image. You can still paste an image URL.');
    } finally {
      setIsUploadingRequestImage(false);
    }
  };

  const handleRequestDishImageChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file.');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be 5 MB or smaller.');

    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await api.post('/upload/local', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRequestDishes((current) => current.map((dish, dishIndex) => dishIndex === index ? { ...dish, image: response.data.imageUrl } : dish));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to upload this dish image.');
    }
  };

  const handleSubmitRestaurantRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requestTags.length) {
      toast.error('Please select or add at least one cuisine tag.');
      return;
    }
    setIsSubmittingRequest(true);
    try {
      await api.post('/restaurant-requests', {
        name: requestName.trim(),
        address: requestAddress,
        streetAddress: requestAddressParts.streetAddress.trim(),
        ward: requestAddressParts.ward.trim(),
        district: requestAddressParts.district.trim(),
        city: requestAddressParts.city.trim(),
        country: requestAddressParts.country.trim(),
        tags: requestTags,
        amenities: requestAmenities.split(',').map((amenity) => amenity.trim()).filter(Boolean),
        image: requestImage.trim() || undefined,
        description: requestDescription.trim() || undefined,
        openingTime: requestOpeningTime || undefined,
        closingTime: requestClosingTime || undefined,
        dishes: requestDishes.filter((dish) => dish.name.trim()).map((dish) => ({
          name: dish.name.trim(),
          price: dish.price.trim(),
          image: dish.image?.trim() || undefined,
        })),
      });
      setShowSubmitModal(false);
      setRequestName('');
      setRequestAddressParts(createVietnamAddressParts());
      setRequestAmenities('');
      setRequestTags([]);
      setRequestTagDraft('');
      setRequestImage('');
      setRequestImagePreview('');
      setRequestDescription('');
      setRequestOpeningTime('');
      setRequestClosingTime('');
      setRequestDishes([{ name: '', price: '' }]);
      setShowRequestRestaurantImageOptions(false);
      setActiveRequestDishImageOptions(null);
      toast.success('Restaurant suggestion submitted for review.');
      try {
        const response = await api.get('/restaurant-requests/my');
        setRestaurantRequests(response.data || []);
      } catch (refreshError) {
        console.error('Request submitted, but list refresh failed:', refreshError);
        toast.info('Your suggestion was submitted. Reload the page to refresh the list.');
      }
    } catch (error: any) {
      console.error('Failed to submit restaurant:', error);
      toast.error(error?.response?.data?.message || 'Unable to submit your restaurant suggestion.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const addRequestTags = (rawTags: string) => {
    const additions = rawTags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) =>
      availableRestaurantTags.find((existingTag) => existingTag.toLocaleLowerCase() === tag.toLocaleLowerCase()) || tag
    );
    if (!additions.length) return;
    setRequestTags((current) => {
      const seen = new Set(current.map((tag) => tag.toLocaleLowerCase()));
      return [...current, ...additions.filter((tag) => {
        const normalized = tag.toLocaleLowerCase();
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      })].slice(0, 12);
    });
    setRequestTagDraft('');
  };

  const toggleRequestTag = (tag: string) => {
    setRequestTags((current) => current.includes(tag)
      ? current.filter((item) => item !== tag)
      : current.length < 12 ? [...current, tag] : current);
  };

  useEffect(() => {
    api.get('/restaurant-requests/my')
      .then((response) => setRestaurantRequests(response.data || []))
      .catch((error: any) => {
        console.error('Failed to load restaurant submissions:', error);
        toast.error(error?.response?.data?.message || 'Unable to load your restaurant suggestions.');
      })
      .finally(() => setIsLoadingRequests(false));
  }, []);

  useEffect(() => {
    if (location.state?.profileTab === 'submissions') setActiveProfileTab('submissions');
  }, [location.state]);

  useEffect(() => {
    if (!showSubmitModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmittingRequest) setShowSubmitModal(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSubmitModal, isSubmittingRequest]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTempAvatar(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await api.put('/users/me', {
        username: tempName,
        phone: tempPhone,
        address: tempAddress,
        streetAddress: profileAddressParts.streetAddress,
        ward: profileAddressParts.ward,
        district: profileAddressParts.district,
        city: profileAddressParts.city,
        country: profileAddressParts.country,
        avatar: tempAvatar,
        taste_profile: tempTasteProfile,
        preferred_area: selectedArea,
        preferred_city_code: selectedCityCode,
        preferred_district_code: selectedArea,
        price_range: selectedPriceRange,
      });

      applyProfile(res.data);
      setBio(tempBio);
      setAddress(tempAddress);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setTempName(name);
    setTempBio(bio);
    setTempPhone(phone);
    setProfileAddressParts(address ? addressPartsFromLegacy(address) : createEmptyAddressParts());
    setTempAvatar(avatar);
    setTempTasteProfile(selectedPreferences);
    setIsEditing(false);
  };

  const togglePreference = (pref: string) => {

    setSelectedPreferences((prev) => 
    {

      if (pref === "Any") 
      {
        return ["Any"];
      }

      const newPreferences = prev.filter((p) => p !== "Any");

      if (newPreferences.includes(pref)) 
      {

        const removed = newPreferences.filter((p) => p !== pref);

        return removed.length === 0
          ? ["Any"]
          : removed;

      }


      // Có taste cụ thể -> thêm và loại Any
      return [
        ...newPreferences,
        pref
      ];

    });
  };

  const toggleTempTaste = (pref: string) => {

    setTempTasteProfile((prev) => {


      if(pref === "Any"){

        return ["Any"];

      }


      const newProfile = prev.filter(
        p => p !== "Any"
      );


      if(newProfile.includes(pref)){

        const removed = newProfile.filter(
          p => p !== pref
        );


        return removed.length === 0
          ? ["Any"]
          : removed;

      }


      return [
        ...newProfile,
        pref
      ];

    });

  };

  const handleSavePreferences = async () => {
    try {
      const res = await api.put('/users/me', {
        taste_profile: selectedPreferences,
        preferred_area: selectedArea,
        preferred_city_code: selectedCityCode,
        preferred_district_code: selectedArea,
        price_range: selectedPriceRange,
      });
      applyProfile(res.data);
      toast.success('Preferences saved successfully!');
    } catch (err: any) {
      console.error('Failed to save preferences:', err);
      toast.error(err?.response?.data?.message || 'Failed to save preferences');
    }
  };

  const favoriteRestaurants = allRestaurants.filter((restaurant) =>
    favoriteIds.includes(Number(restaurant.id))
  );

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 pb-8 pt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center md:items-start">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 p-1 border-4 border-white shadow-lg">
                <img
                  src={isEditing ? tempAvatar : avatar}
                  alt={name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {isEditing && (
                <>
                  <label
                    htmlFor="avatarUpload"
                    className="mt-2 text-xs text-[#FF6B35] cursor-pointer hover:underline"
                  >
                    Change avatar
                  </label>
                  <input
                    id="avatarUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              {isEditing ? (
                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg font-bold text-xl outline-none"
                    placeholder="Your name"
                  />
                  <input
                    type="text"
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg text-slate-600 outline-none"
                    placeholder="Your bio"
                  />
                  <input
                    type="text"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-600 outline-none"
                    placeholder="Phone number"
                  />
                  <div>
                    <AddressFields value={profileAddressParts} onChange={setProfileAddressParts} />
                    <p className="mt-2 text-xs text-gray-500">Display address: {tempAddress || 'Complete the address fields above'}</p>
                  </div>

                  <div className="mt-4">
                    <label className="block font-medium text-gray-700 mb-3">
                      Taste Profile
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {preferences.map((pref) => (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => toggleTempTaste(pref)}
                          className={`px-3 py-2 rounded-lg border transition-colors ${
                            tempTasteProfile.includes(pref)
                              ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#FF6B35]'
                          }`}
                        >
                          {pref}
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Your taste profile helps us recommend restaurants that match your preferences.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors disabled:bg-gray-400"
                    >
                      <Check className="w-4 h-4" /> {isSavingProfile ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-slate-800 mb-1">{name}</h1>
                  <p className="text-slate-500 mb-1">{bio}</p>
                  <p className="text-slate-400 text-sm mb-2">{email}</p>

                  <div className="flex flex-col gap-1 text-sm text-slate-500 mb-4">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <Phone className="w-4 h-4 text-[#FF6B35]" />
                      <span>{phone || 'No phone added'}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <MapPin className="w-4 h-4 text-[#FF6B35]" />
                      <span>{address}</span>
                    </div>
                  </div>
                </>
              )}

              {!isEditing && (
                <>
                  <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm mb-4">
                    <div className="text-center">
                      <span className="block font-bold text-slate-800 text-lg">0</span>
                      <span className="text-gray-400">Reviews</span>
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-slate-800 text-lg">{myTours.length}</span>
                      <span className="text-gray-400">Tours Created</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {selectedPreferences.slice(0, 4).map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-orange-50 text-[#FF6B35] rounded-full text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              {!isEditing && (
                <button
                  onClick={() => {
                    setTempTasteProfile(selectedPreferences);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden md:inline">Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs.Root value={activeProfileTab} onValueChange={setActiveProfileTab}>
          <Tabs.List className="mb-8 flex flex-wrap border-b border-gray-200">
            <Tabs.Trigger
              value="tours"
              className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-[#FF6B35] data-[state=active]:border-[#FF6B35] data-[state=active]:text-[#FF6B35] transition-colors flex items-center gap-2"
            >
              <Map className="w-4 h-4" /> My Saved Tours
            </Tabs.Trigger>
            <Tabs.Trigger
              value="favorites"
              className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-[#FF6B35] data-[state=active]:border-[#FF6B35] data-[state=active]:text-[#FF6B35] transition-colors flex items-center gap-2"
            >
              <Heart className="w-4 h-4" /> Favorite Restaurants
            </Tabs.Trigger>
            <Tabs.Trigger
              value="preferences"
              className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-[#FF6B35] data-[state=active]:border-[#FF6B35] data-[state=active]:text-[#FF6B35] transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" /> Preferences
            </Tabs.Trigger>
            <Tabs.Trigger
              value="submissions"
              className="flex items-center gap-2 border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-[#FF6B35] data-[state=active]:border-[#FF6B35] data-[state=active]:text-[#FF6B35]"
            >
              <Store className="w-4 h-4" /> My Suggestions
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="tours" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTours.map((tour) => (
                <div key={tour.id} className="h-full">
                  <TourCard tour={tour} />
                </div>
              ))}
              {myTours.length === 0 && (
                <div className="col-span-full rounded-xl bg-white p-8 text-center text-gray-500">
                  No tours created yet.
                </div>
              )}
            </div>
          </Tabs.Content>

          <Tabs.Content value="favorites" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteRestaurants.map((restaurant) => (
                <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`}>
                  <RestaurantCard restaurant={restaurant} />
                </Link>
              ))}
              {favoriteRestaurants.length === 0 && (
                <div className="col-span-full rounded-xl bg-white p-8 text-center text-gray-500">
                  No favorite restaurants yet.
                </div>
              )}
            </div>
          </Tabs.Content>

          <Tabs.Content value="preferences" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-2xl bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Food Preferences</h2>

              <div className="mb-8">
                <label className="block font-medium text-gray-700 mb-3">
                  What do you like?
                </label>
                <div className="flex flex-wrap gap-2">
                  {preferences.map((pref) => (
                    <button
                      key={pref}
                      onClick={() => togglePreference(pref)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${selectedPreferences.includes(pref)
                        ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#FF6B35]'
                        }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block font-medium text-gray-700 mb-3">
                  Price Range
                </label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                >
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-8">
                <label className="block font-medium text-gray-700 mb-3">
                  Preferred City
                </label>
                <select
                  value={selectedCityCode}
                  onChange={(e) => setSelectedCityCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                >
                  {cities.map((city) => (
                    <option key={city.value} value={city.value}>{city.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-8">
                <label className="block font-medium text-gray-700 mb-3">
                  Preferred Area
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="
                    w-full 
                    px-4 
                    py-3 
                    border 
                    border-gray-300 
                    rounded-lg
                    outline-none
                    focus:ring-2
                    focus:ring-[#FF6B35]
                    focus:border-transparent
                    bg-white
                  "
                >

                  <option value="">
                    Select your preferred area
                  </option>


                  {areaOptions.map((area) => (
                    <option 
                      key={area}
                      value={area}
                    >
                      {area}
                    </option>
                  ))}


                </select>
              </div>

              <button
                onClick={handleSavePreferences}
                className="w-full bg-[#FF6B35] text-white py-3 rounded-lg font-bold hover:bg-[#e55a2b] transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Save Preferences
              </button>
            </div>
          </Tabs.Content>

          <Tabs.Content value="submissions" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">My Restaurant Suggestions</h2>
                <p className="mt-1 text-sm text-gray-500">Track the review status of restaurants you have submitted.</p>
              </div>
              <button type="button" onClick={() => setShowSubmitModal(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-4 py-2.5 font-medium text-white hover:bg-[#e55a2b]">
                <Plus className="h-4 w-4" /> Suggest a Restaurant
              </button>
            </div>
            {isLoadingRequests ? (
              <div className="rounded-xl bg-white p-8 text-center text-gray-500">Loading suggestions...</div>
            ) : restaurantRequests.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-center text-gray-500">You have not submitted any restaurants yet.</div>
            ) : (
              <div className="space-y-4">
                {restaurantRequests.map((request) => {
                  const badgeClass = request.status === 'Approved'
                    ? 'bg-green-100 text-green-700'
                    : request.status === 'Rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700';
                  const statusLabel = request.status === 'Approved' ? 'Approved' : request.status === 'Rejected' ? 'Rejected' : 'Pending';
                  return (
                    <article key={request._id} className="restaurant-suggestion-card rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                      <div className="restaurant-suggestion-card__image overflow-hidden rounded-lg bg-orange-50 text-[#FF6B35]">
                        {request.image ? <img src={request.image} alt={request.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Store className="h-8 w-8" /></div>}
                      </div>
                      <div className="restaurant-suggestion-card__content">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="font-semibold text-slate-800">{request.name}</h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>{statusLabel}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{request.tags?.join(', ') || request.cuisine || 'No tags'} · {request.address}</p>
                        {(request.openingTime || request.closingTime) && <p className="mt-1 text-xs text-gray-500">Hours: {request.openingTime || '—'}–{request.closingTime || '—'}</p>}
                        {!!request.dishes?.length && <p className="mt-1 text-xs text-gray-500">Menu: {request.dishes.map((dish) => dish.price ? `${dish.name} (${dish.price})` : dish.name).join(' · ')}</p>}
                        {!!request.tags?.length && <div className="mt-2 flex flex-wrap gap-1.5">{request.tags.map((tag) => <span key={tag} className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-[#D94E1F]">{tag}</span>)}</div>}
                        {request.description && <p className="mt-2 text-sm text-gray-500">{request.description}</p>}
                        {request.adminNote && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Admin note: {request.adminNote}</p>}
                        <p className="mt-2 text-xs text-gray-400">Submitted on {new Date(request.createdAt).toLocaleDateString('en-US')}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {showSubmitModal && (
        <div className="restaurant-modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isSubmittingRequest) setShowSubmitModal(false);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="submit-restaurant-title" className="restaurant-modal restaurant-modal--suggest">
            <form onSubmit={handleSubmitRestaurantRequest} className="restaurant-modal__form">
            <div className="restaurant-modal__body">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="submit-restaurant-title" className="text-lg font-semibold text-gray-900">Suggest a Restaurant</h2>
                <button type="button" aria-label="Close" disabled={isSubmittingRequest} onClick={() => setShowSubmitModal(false)} className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-50">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mb-4 text-sm text-gray-500">Our team will review your suggestion before it appears on CityFoodTour.</p>
              <label className="mb-3 block text-sm text-gray-700">Restaurant Name
                <input required maxLength={120} value={requestName} onChange={(event) => setRequestName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20" placeholder="Enter restaurant name" />
              </label>
              <div className="mb-4">
                <AddressFields value={requestAddressParts} onChange={setRequestAddressParts} requiredDistrict />
                <p className="mt-2 text-xs text-gray-500">Display address: {requestAddress || 'Complete the address fields above'}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="relative text-sm text-gray-700">Restaurant Image
                  <button type="button" onClick={() => setShowRequestRestaurantImageOptions((current) => !current)} className="mt-1.5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-gray-50 text-gray-400 transition hover:ring-2 hover:ring-[#FF6B35]">
                    {(requestImagePreview || requestImage) ? <img src={requestImagePreview || requestImage} alt="Restaurant preview" className="h-full w-full object-cover" /> : <span className="px-1 text-center text-[10px]">No image</span>}
                  </button>
                  {showRequestRestaurantImageOptions && (
                    <div className="absolute left-20 top-7 z-20 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                      <label htmlFor="suggestRestaurantImage" className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">{isUploadingRequestImage ? 'Uploading...' : 'Upload image'}</label>
                      <input id="suggestRestaurantImage" type="file" accept="image/*" onChange={handleRequestImageChange} disabled={isUploadingRequestImage} className="hidden" />
                      <input type="url" maxLength={1000} value={requestImagePreview ? '' : requestImage} onChange={(event) => { setRequestImage(event.target.value); setRequestImagePreview(''); }} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]" placeholder="Paste image URL" />
                    </div>
                  )}
                </div>
                <label className="block text-sm text-gray-700">Amenities (comma separated)
                  <input maxLength={300} value={requestAmenities} onChange={(event) => setRequestAmenities(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20" placeholder="Wifi, Parking, ..." />
                </label>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-sm text-gray-700">Opening Time
                  <input type="time" value={requestOpeningTime} onChange={(event) => setRequestOpeningTime(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20" />
                </label>
                <label className="block text-sm text-gray-700">Closing Time
                  <input type="time" value={requestClosingTime} onChange={(event) => setRequestClosingTime(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20" />
                </label>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-gray-700">Cuisine & Restaurant Tags <span className="text-red-500">*</span></label>
                {availableRestaurantTags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableRestaurantTags.map((tag) => {
                      const selected = requestTags.includes(tag);
                      return <button key={tag} type="button" aria-pressed={selected} onClick={() => toggleRequestTag(tag)} className={`rounded-full border px-3 py-1 text-xs transition-colors ${selected ? 'border-[#FF6B35] bg-orange-50 text-[#D94E1F]' : 'border-gray-200 text-gray-600 hover:border-[#FF6B35]'}`}>{tag}</button>;
                    })}
                  </div>
                ) : <p className="mt-2 text-xs text-gray-500">No existing tags yet. Add a new one below.</p>}
                <div className="mt-1.5 flex gap-2">
                  <input
                    value={requestTagDraft}
                    onChange={(event) => setRequestTagDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ',') {
                        event.preventDefault();
                        addRequestTags(requestTagDraft);
                      }
                    }}
                    onBlur={() => addRequestTags(requestTagDraft)}
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"
                    placeholder="Add a new tag — press Enter or comma"
                  />
                  <button type="button" onClick={() => addRequestTags(requestTagDraft)} className="rounded-lg border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50">Add</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {requestTags.filter((tag) => !availableRestaurantTags.includes(tag)).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-[#D94E1F]">
                      {tag}
                      <button type="button" aria-label={`Remove ${tag} tag`} onClick={() => setRequestTags((current) => current.filter((item) => item !== tag))} className="rounded-full hover:bg-orange-100">×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-gray-700">Menu (Dishes)</label>
                <div className="mt-2 space-y-2">
                  {requestDishes.map((dish, index) => (
                    <div key={index} className="restaurant-dish-row rounded-lg border border-gray-200 p-3">
                      <div className="relative">
                        <button type="button" onClick={() => setActiveRequestDishImageOptions((current) => current === index ? null : index)} className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border bg-gray-100 transition hover:ring-2 hover:ring-[#FF6B35]">
                          {dish.image ? <img src={dish.image} alt="Dish" className="h-full w-full object-cover" /> : <span className="px-1 text-center text-[10px] text-gray-400">No image</span>}
                        </button>
                        {activeRequestDishImageOptions === index && (
                          <div className="absolute left-20 top-0 z-20 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                            <label htmlFor={`suggestDishImage-${index}`} className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">Upload image</label>
                            <input id={`suggestDishImage-${index}`} type="file" accept="image/*" className="hidden" onChange={(event) => { handleRequestDishImageChange(index, event); setActiveRequestDishImageOptions(null); }} />
                            <input type="url" placeholder="Paste image URL" value={dish.image || ''} onChange={(event) => setRequestDishes((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, image: event.target.value } : item))} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]" />
                          </div>
                        )}
                      </div>
                      <input value={dish.name} onChange={(event) => setRequestDishes((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} maxLength={120} aria-label={`Dish ${index + 1} name`} className="min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#FF6B35]" placeholder="Dish name" />
                      <input value={dish.price} onChange={(event) => setRequestDishes((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, price: event.target.value } : item))} maxLength={40} aria-label={`Dish ${index + 1} price`} className="min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#FF6B35]" placeholder="Price (VND)" />
                      {requestDishes.length > 1 && <button type="button" aria-label={`Remove dish ${index + 1}`} onClick={() => setRequestDishes((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="text-xs text-red-500 md:text-sm">✕</button>}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setRequestDishes((current) => [...current, { name: '', price: '' }])} className="mt-2 text-sm text-[#FF6B35] hover:underline">+ Add dish</button>
              </div>
              <label className="mt-4 block text-sm text-gray-700">Description
                <textarea rows={3} maxLength={1000} value={requestDescription} onChange={(event) => setRequestDescription(event.target.value)} className="mt-1.5 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20" placeholder="Describe the restaurant" />
              </label>
            </div>
            <div className="restaurant-modal__footer">
                <button type="submit" disabled={isSubmittingRequest || isUploadingRequestImage} className="flex-1 rounded-lg bg-[#FF6B35] py-2.5 text-sm text-white transition-colors hover:bg-[#FF5722] disabled:cursor-not-allowed disabled:opacity-60">
                  {isUploadingRequestImage ? 'Uploading image...' : isSubmittingRequest ? 'Submitting...' : 'Submit Restaurant'}
                </button>
                <button type="button" disabled={isSubmittingRequest} onClick={() => setShowSubmitModal(false)} className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
