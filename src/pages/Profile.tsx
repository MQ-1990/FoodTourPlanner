import React, { useEffect, useState } from 'react';
import { Settings, Map, Heart, Edit2, Check, X, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TourCard } from '../components/TourCard';
import { RestaurantCard } from '../components/RestaurantCard';
import { useRestaurants } from '../context/RestaurantContext';
import * as Tabs from '@radix-ui/react-tabs';
import { toast } from 'sonner';
import api from '../lib/api';

interface ProfileUser {
  _id: string;
  email: string;
  username?: string;
  phone?: string | null;
  avatar?: string | null;
  taste_profile?: string[];
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

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?u=a042581f4e29026024d';
const DEFAULT_BIO = 'Foodie - Explorer - Coffee Addict';
const DEFAULT_ADDRESS = 'District 1, Ho Chi Minh City';

export const Profile = () => {
  const { restaurants: allRestaurants } = useRestaurants();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState(DEFAULT_BIO);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [myTours, setMyTours] = useState<ProfileTour[]>([]);

  const [tempName, setTempName] = useState('');
  const [tempBio, setTempBio] = useState(DEFAULT_BIO);
  const [tempPhone, setTempPhone] = useState('');
  const [tempAddress, setTempAddress] = useState(DEFAULT_ADDRESS);
  const [tempAvatar, setTempAvatar] = useState(DEFAULT_AVATAR);

  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(() => {
    const saved = localStorage.getItem('userTastePreferences');
    return saved ? JSON.parse(saved) : ['Spicy', 'Seafood', 'Coffee'];
  });
  const [selectedPriceRange, setSelectedPriceRange] = useState('100,000 - 300,000 VND');
  const [selectedArea, setSelectedArea] = useState(DEFAULT_ADDRESS);

  const preferences = ['Spicy', 'Sweet', 'Seafood', 'Coffee', 'Milk Tea', 'Vegetarian', 'BBQ', 'Pho', 'Noodles'];
  const priceRanges = ['< 50,000 VND', '50,000 - 100,000 VND', '100,000 - 300,000 VND', '300,000 - 500,000 VND', '> 500,000 VND'];

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
    const tastes = Array.isArray(profile.taste_profile) && profile.taste_profile.length
      ? profile.taste_profile
      : [];

    setName(displayName);
    setEmail(profile.email || '');
    setPhone(displayPhone);
    setAvatar(displayAvatar);
    setTempName(displayName);
    setTempPhone(displayPhone);
    setTempAvatar(displayAvatar);
    setFavoriteIds(Array.isArray(profile.favorites) ? profile.favorites : []);

    if (tastes.length) {
      setSelectedPreferences(tastes);
      localStorage.setItem('userTastePreferences', JSON.stringify(tastes));
    }
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
        avatar: tempAvatar,
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
    setTempAddress(address);
    setTempAvatar(avatar);
    setIsEditing(false);
  };

  const togglePreference = (pref: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(pref)
        ? prev.filter((p) => p !== pref)
        : [...prev, pref]
    );
  };

  const handleSavePreferences = async () => {
    try {
      const res = await api.put('/users/me', {
        taste_profile: selectedPreferences,
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
                  <input
                    type="text"
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-600 outline-none"
                    placeholder="Address"
                  />
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
                  onClick={() => setIsEditing(true)}
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
        <Tabs.Root defaultValue="tours">
          <Tabs.List className="flex border-b border-gray-200 mb-8">
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
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div className="mb-8">
                <label className="block font-medium text-gray-700 mb-3">
                  Preferred Area
                </label>
                <input
                  type="text"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  placeholder="e.g., District 1, Ho Chi Minh City"
                />
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
        </Tabs.Root>
      </div>
    </div>
  );
};
