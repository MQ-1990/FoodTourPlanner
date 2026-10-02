import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, Star, TrendingUp, Search, Edit, Trash2, Check, X, Plus, BarChart3, LogOut, ChevronDown, User, ClipboardCheck } from 'lucide-react';
import { MOCK_TOURS } from '../lib/data';
import { useRestaurants } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { AddressFields, addressPartsFromLegacy, createVietnamAddressParts, formatAddress, type AddressParts } from '../components/AddressFields';

type MenuItem = {
  name: string;
  price: string;
  image?: string;
};

type AdminUser = {
  _id: string;
  email: string;
  username?: string;
  role: 'admin' | 'user';
  createdAt?: string;
  isLocked?: boolean;
};

type RestaurantRequest = {
  _id: string;
  name: string;
  address: string;
  cuisine?: string;
  openingTime?: string;
  closingTime?: string;
  dishes?: MenuItem[];
  tags?: string[];
  image?: string | null;
  description?: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  user?: { username?: string; email?: string; phone?: string };
};

const isPostcodeLike = (value: unknown) => /^\d{4,10}(?:-\d{3,4})?$/.test(String(value || '').trim());

const getRestaurantAreaLabel = (restaurant: any) => {
  const district = String(restaurant.district || '').trim();
  if (district && !isPostcodeLike(district)) return district;

  const parts = String(restaurant.address || '').split(',').map((part) => part.trim()).filter(Boolean);
  const namedDistrict = parts.find((part) => /\b(district|quan|quận|ward|phuong|phường|thu duc)\b/i.test(part));
  if (namedDistrict) return namedDistrict;
  return parts.find((part) => /ho chi minh|hanoi|ha noi|da nang/i.test(part) && !isPostcodeLike(part)) || 'Area unavailable';
};

const getRestaurantCityLabel = (restaurant: any) => {
  if (restaurant.city) return restaurant.city;
  const code = String(restaurant.cityCode || '').toLowerCase();
  if (code === 'ho-chi-minh') return 'Ho Chi Minh City';
  if (code === 'ha-noi') return 'Hanoi';
  if (code === 'da-nang') return 'Da Nang';
  return code ? code.replace(/-/g, ' ') : 'Ho Chi Minh City';
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { restaurants: allRestaurants, refetch } = useRestaurants();
  const availableRestaurantTags = (() => {
    const tags = new Map<string, string>();
    allRestaurants.flatMap((restaurant) => restaurant.tags ?? []).forEach((tag) => {
      const trimmed = tag?.trim();
      if (trimmed && !tags.has(trimmed.toLocaleLowerCase())) tags.set(trimmed.toLocaleLowerCase(), trimmed);
    });
    return [...tags.values()].sort((a, b) => a.localeCompare(b));
  })();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'users' | 'requests'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userActionId, setUserActionId] = useState<string | null>(null);
  const [restaurantRequests, setRestaurantRequests] = useState<RestaurantRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestActionId, setRequestActionId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRestaurantRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const response = await api.get('/restaurant-requests');
      setRestaurantRequests(response.data || []);
    } catch (error: any) {
      console.error('Failed to load restaurant requests:', error);
      alert(error?.response?.data?.message || 'Failed to load restaurant submissions');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') fetchRestaurantRequests();
  }, [activeTab]);

  const handleRestaurantRequest = async (request: RestaurantRequest, action: 'approve' | 'reject') => {
    let adminNote: string | undefined;
    if (action === 'reject') {
      const note = window.prompt('Optional rejection note:');
      if (note === null) return;
      adminNote = note.trim() || undefined;
    } else if (!window.confirm(`Approve and add “${request.name}” to the restaurant list?`)) {
      return;
    }

    setRequestActionId(request._id);
    try {
      await api.patch(`/restaurant-requests/${request._id}/${action}`, action === 'reject' ? { adminNote } : {});
      await fetchRestaurantRequests();
      if (action === 'approve') await refetch();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Unable to update this restaurant suggestion.');
    } finally {
      setRequestActionId(null);
    }
  };

  useEffect(() => {
    if (showAddDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddDialog]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchAdminUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await api.get('/users');
      setAdminUsers(res.data);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      alert(err?.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAdminUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  // Mock admin stats
  const stats = {
    totalUsers: adminUsers.length,
    totalRestaurants: allRestaurants.length,
    totalReviews: 8542,
    activeTours: MOCK_TOURS.length,
    newUsersThisWeek: 124,
    newReviewsThisWeek: 342
  };

  // Derive display list directly from context (always in sync after refetch)
  const restaurantList = allRestaurants.map(r => ({
    ...r,
    cuisine: r.tags,
    storedDistrict: r.district,
    storedDistrictCode: r.districtCode,
    district: getRestaurantAreaLabel(r),
    reviews: r.reviewCount,
    isOpen: r.openNow,
    openingTime: r.openingTime || '',
    closingTime: r.closingTime || '',
    amenities: r.amenities || [],
    menu: r.dishes.map(d => ({ name: d.name, price: d.price, image: d.image })),
  }));

  // Form state for Add Restaurant
  const [newName, setNewName] = useState('');
  const [addressParts, setAddressParts] = useState<AddressParts>(createVietnamAddressParts);
  const [newOpeningTime, setNewOpeningTime] = useState('');
  const [newClosingTime, setNewClosingTime] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const newAddress = formatAddress(addressParts);
  const [newAmenities, setNewAmenities] = useState(''); // comma-separated
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [editingRestaurant, setEditingRestaurant] = useState<any | null>(null);
  const [showRestaurantImageOptions, setShowRestaurantImageOptions] = useState(false);
  const [activeDishImageOptions, setActiveDishImageOptions] = useState<number | null>(null);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { name: '', price: '', image: '' },
  ]);

  // Mở modal ở chế độ ADD – reset form
  const openAddDialog = () => {
    setEditingRestaurant(null);

    setNewName('');
    setAddressParts(createVietnamAddressParts());
    setNewOpeningTime('');
    setNewClosingTime('');
    setNewDescription('');
    setNewImageUrl('');
    setNewAmenities('');
    setNewTags([]);
    setTagDraft('');
    setMenuItems([{ name: '', price: '', image: '' }]);
    setShowRestaurantImageOptions(false);
    setActiveDishImageOptions(null);

    setShowAddDialog(true);
  };

  // Mở modal ở chế độ EDIT – fill form từ restaurant
  const openEditDialog = (restaurant: any) => {
    setEditingRestaurant(restaurant);

    setNewName(restaurant.name || '');
    const storedDistrict = restaurant.storedDistrict ?? restaurant.district;
    const legacyParts = addressPartsFromLegacy(restaurant.address || '', isPostcodeLike(storedDistrict) ? '' : (storedDistrict || ''), getRestaurantCityLabel(restaurant));
    setAddressParts({
      streetAddress: restaurant.streetAddress || legacyParts.streetAddress,
      ward: restaurant.ward || legacyParts.ward,
      district: !isPostcodeLike(storedDistrict) && storedDistrict ? storedDistrict : legacyParts.district,
      city: restaurant.city || legacyParts.city,
      country: restaurant.country || legacyParts.country,
    });
    setNewOpeningTime(restaurant.openingTime || '');
    setNewClosingTime(restaurant.closingTime || '');
    setNewDescription(restaurant.description || '');
    setNewImageUrl(restaurant.image || '');
    setNewAmenities(Array.isArray(restaurant.amenities) ? restaurant.amenities.join(', ') : '');
    const existingTags = Array.isArray(restaurant.tags) ? restaurant.tags : Array.isArray(restaurant.cuisine) ? restaurant.cuisine : [];
    setNewTags(existingTags);
    setTagDraft('');

    setMenuItems(
      restaurant.menu && restaurant.menu.length
        ? restaurant.menu.map((m: any) => ({
          name: m.name || '',
          price: String(m.price ?? ''),
          image: m.image || '',
        }))
        : [{ name: '', price: '', image: '' }]
    );

    setShowAddDialog(true);
    setShowRestaurantImageOptions(false);
    setActiveDishImageOptions(null);
  };

  const addRestaurantTags = (rawTags: string) => {
    const additions = rawTags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) =>
      availableRestaurantTags.find((existingTag) => existingTag.toLocaleLowerCase() === tag.toLocaleLowerCase()) || tag
    );
    if (!additions.length) return;
    setNewTags((current) => {
      const seen = new Set(current.map((tag) => tag.toLocaleLowerCase()));
      return [...current, ...additions.filter((tag) => {
        const normalized = tag.toLocaleLowerCase();
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      })].slice(0, 12);
    });
    setTagDraft('');
  };

  const toggleRestaurantTag = (tag: string) => {
    setNewTags((current) => current.includes(tag)
      ? current.filter((item) => item !== tag)
      : current.length < 12 ? [...current, tag] : current);
  };


  const handleMenuItemChange = (
    index: number,
    field: 'name' | 'price' | 'image',
    value: string
  ) => {
    setMenuItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddMenuItemRow = () => {
    setMenuItems((prev) => [...prev, { name: '', price: '' }]);
  };

  const handleRemoveMenuItemRow = (index: number) => {
    setMenuItems((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImageFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/upload/local', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.imageUrl; // permanent URL
    } catch (err) {
      console.error('Upload failed:', err);
      return ''; // fallback
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    setNewImageUrl(URL.createObjectURL(file));
    // Upload and replace with permanent URL
    const permanentUrl = await uploadImageFile(file);
    if (permanentUrl) setNewImageUrl(permanentUrl);
  };

  const handleMenuItemImageChange = async (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const preview = URL.createObjectURL(file);
    setMenuItems((prev) => {
      const copy = [...prev];
      copy[index].image = preview;
      return copy;
    });

    // Upload and replace with permanent URL
    const permanentUrl = await uploadImageFile(file);
    if (permanentUrl) {
      setMenuItems((prev) => {
        const copy = [...prev];
        copy[index].image = permanentUrl;
        return copy;
      });
    }
  };

  const resetForm = () => {
    setShowAddDialog(false);
    setEditingRestaurant(null);
    setNewName('');
    setAddressParts(createVietnamAddressParts());
    setNewOpeningTime('');
    setNewClosingTime('');
    setNewDescription('');
    setNewImageUrl('');
    setNewAmenities('');
    setNewTags([]);
    setTagDraft('');
    setMenuItems([{ name: '', price: '' }]);
    setShowRestaurantImageOptions(false);
    setActiveDishImageOptions(null);
  };

  const handleSaveRestaurant = async () => {
    if (!newName.trim()) {
      alert('Please enter restaurant name');
      return;
    }
    if (!newTags.length) {
      alert('Please select or add at least one cuisine tag.');
      return;
    }
    if (!addressParts.streetAddress.trim() || !addressParts.district.trim() || !addressParts.city.trim() || !addressParts.country.trim()) {
      alert('Please complete the street address, district/area, city, and country.');
      return;
    }

    const cleanedMenu = menuItems.filter(
      (item) => item.name.trim() && item.price.trim()
    );

    const amenitiesParsed = newAmenities ? newAmenities.split(',').map(a => a.trim()).filter(Boolean) : [];

    setIsSaving(true);
    try {
      if (editingRestaurant) {
        // MODE EDIT: gọi PUT /api/restaurants/:id
        // Preserve existing fields that the form doesn't edit
        const editPayload = {
          name: newName,
          address: newAddress,
          streetAddress: addressParts.streetAddress,
          ward: addressParts.ward,
          district: addressParts.district,
          city: addressParts.city,
          country: addressParts.country,
          image: newImageUrl || editingRestaurant.image || '',
          openingTime: newOpeningTime,
          closingTime: newClosingTime,
          description: newDescription,
          amenities: amenitiesParsed.length > 0 ? amenitiesParsed : (editingRestaurant.amenities || []),
          dishes: cleanedMenu.length > 0 ? cleanedMenu : (editingRestaurant.dishes || []),
          // Preserve fields not in the form
          tags: newTags,
          priceRange: editingRestaurant.priceRange || '$$',
          phone: editingRestaurant.phone || '',
          reviews: editingRestaurant.reviews || [],
        };
        await api.put(`/restaurants/${editingRestaurant.id}`, editPayload);
      } else {
        // MODE ADD: gọi POST /api/restaurants
        const addPayload = {
          name: newName,
          address: newAddress,
          streetAddress: addressParts.streetAddress,
          ward: addressParts.ward,
          district: addressParts.district,
          city: addressParts.city,
          country: addressParts.country,
          image: newImageUrl || '',
          openingTime: newOpeningTime,
          closingTime: newClosingTime,
          description: newDescription,
          amenities: amenitiesParsed,
          tags: newTags,
          dishes: cleanedMenu,
        };
        await api.post('/restaurants', addPayload);
      }
      await refetch(); // reload data từ backend vào context
      resetForm();
    } catch (err: any) {
      console.error('Lỗi lưu nhà hàng:', err);
      alert(err?.response?.data?.message || 'Lỗi khi lưu. Kiểm tra console.');
    } finally {
      setIsSaving(false);
    }
  };


  const filteredRestaurants = restaurantList.filter(r =>
    searchQuery === '' || r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      await api.delete(`/restaurants/${id}`);
      await refetch();
    } catch (err: any) {
      console.error('Lỗi xoá nhà hàng:', err);
      alert(err?.response?.data?.message || 'Lỗi khi xoá. Kiểm tra console.');
    }
  };

  const handleToggleUserLock = async (targetUser: AdminUser) => {
    const isProtected = targetUser.role === 'admin' || targetUser._id === user?.id;
    if (isProtected) return;

    setUserActionId(targetUser._id);
    try {
      const endpoint = targetUser.isLocked ? `/users/${targetUser._id}/unlock` : `/users/${targetUser._id}/lock`;
      const res = await api.patch(endpoint);
      setAdminUsers((prev) => prev.map((item) => item._id === targetUser._id ? res.data : item));
    } catch (err: any) {
      console.error('Failed to update user status:', err);
      alert(err?.response?.data?.message || 'Failed to update user status');
    } finally {
      setUserActionId(null);
    }
  };

  const handleDeleteUser = async (targetUser: AdminUser) => {
    const isProtected = targetUser.role === 'admin' || targetUser._id === user?.id;
    if (isProtected) return;
    if (!confirm(`Delete user ${targetUser.email}?`)) return;

    setUserActionId(targetUser._id);
    try {
      await api.delete(`/users/${targetUser._id}`);
      setAdminUsers((prev) => prev.filter((item) => item._id !== targetUser._id));
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err?.response?.data?.message || 'Failed to delete user');
    } finally {
      setUserActionId(null);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage restaurants, users, and system analytics</p>
          </div>

          {/* Admin Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-green-600 text-sm">+{stats.newUsersThisWeek} this week</span>
            </div>
            <h3 className="text-2xl text-gray-900 mb-1">{stats.totalUsers.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Total Users</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Store className="w-6 h-6 text-orange-600" />
              </div>

            </div>
            <h3 className="text-2xl text-gray-900 mb-1">{stats.totalRestaurants}</h3>
            <p className="text-gray-600 text-sm">Restaurants</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-green-600 text-sm">+{stats.newReviewsThisWeek} this week</span>
            </div>
            <h3 className="text-2xl text-gray-900 mb-1">{stats.totalReviews.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Reviews</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-purple-600 text-sm">Active</span>
            </div>
            <h3 className="text-2xl text-gray-900 mb-1">{stats.activeTours}</h3>
            <p className="text-gray-600 text-sm">Food Tours</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 whitespace-nowrap transition-colors ${activeTab === 'overview'
                  ? 'border-b-2 border-[#FF6B35] text-[#FF6B35]'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('restaurants')}
                className={`px-6 py-4 whitespace-nowrap transition-colors ${activeTab === 'restaurants'
                  ? 'border-b-2 border-[#FF6B35] text-[#FF6B35]'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Store className="w-5 h-5 inline mr-2" />
                Restaurants
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 whitespace-nowrap transition-colors ${activeTab === 'users'
                  ? 'border-b-2 border-[#FF6B35] text-[#FF6B35]'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-6 py-4 whitespace-nowrap transition-colors ${activeTab === 'requests'
                  ? 'border-b-2 border-[#FF6B35] text-[#FF6B35]'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <ClipboardCheck className="w-5 h-5 inline mr-2" />
                Restaurant Suggestions
                {restaurantRequests.filter((request) => request.status === 'Pending').length > 0 && (
                  <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">{restaurantRequests.filter((request) => request.status === 'Pending').length}</span>
                )}
              </button>

            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-gray-900 mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {[
                      { action: 'New user registered', name: 'Sarah Johnson', time: '5 minutes ago', type: 'user' },
                      { action: 'New review posted', name: 'Phở Hòa Pasteur', time: '12 minutes ago', type: 'review' },
                      { action: 'New tour created', name: 'District 1 Food Tour', time: '1 hour ago', type: 'tour' },
                      { action: 'New restaurant added', name: 'Bún Bò Huế An Phú', time: '2 hours ago', type: 'pending' }


                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                              activity.type === 'tour' ? 'bg-purple-100 text-purple-600' :
                                'bg-orange-100 text-orange-600'
                            }`}>
                            {activity.type === 'user' && <Users className="w-5 h-5" />}
                            {activity.type === 'review' && <Star className="w-5 h-5" />}
                            {activity.type === 'tour' && <TrendingUp className="w-5 h-5" />}
                            {activity.type === 'pending' && <Store className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.name}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-gray-900 mb-4">Most Popular Restaurants</h2>
                  <div className="space-y-3">
                    {allRestaurants.slice(0, 5).map((restaurant, idx) => (
                      <div key={restaurant.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl text-gray-400 w-8">#{idx + 1}</div>
                        <div className="w-16 h-16 rounded-lg overflow-hidden">
                          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-gray-900 mb-1">{restaurant.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{restaurant.rating}</span>
                            <span>•</span>
                            <span>{restaurant.reviewCount} reviews</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Restaurants Tab */}
            {activeTab === 'restaurants' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1 max-w-md flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search restaurants..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 outline-none"
                    />
                  </div>
                  <button
                    onClick={openAddDialog}
                    className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#FF5722] transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Restaurant
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-700">Restaurant</th>
                        <th className="text-left py-3 px-4 text-gray-700">Location</th>
                        <th className="text-left py-3 px-4 text-gray-700">Rating</th>
                        <th className="text-left py-3 px-4 text-gray-700">Status</th>
                        <th className="text-right py-3 px-4 text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRestaurants.map((restaurant) => (
                        <tr key={restaurant.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden">
                                <img
                                  src={restaurant.image}
                                  alt={restaurant.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-gray-900">{restaurant.name}</p>
                                <p className="text-sm text-gray-600">{restaurant.cuisine.join(', ')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{restaurant.district}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-gray-900">{restaurant.rating}</span>
                              <span className="text-gray-500 text-sm">({restaurant.reviews})</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${restaurant.isOpen
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                              }`}>
                              {restaurant.isOpen ? 'Open' : 'Closed'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditDialog(restaurant)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRestaurant(restaurant.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'requests' && (
              <section>
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Restaurant Suggestions</h2>
                    <p className="text-sm text-gray-500">Review suggestions before adding restaurants to the public directory.</p>
                  </div>
                  <button onClick={fetchRestaurantRequests} disabled={isLoadingRequests} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60">
                    {isLoadingRequests ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
                {isLoadingRequests ? (
                  <div className="py-12 text-center text-gray-500">Loading suggestions...</div>
                ) : restaurantRequests.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-500">There are no restaurant suggestions yet.</div>
                ) : (
                  <div className="space-y-4">
                    {restaurantRequests.map((request) => (
                      <article key={request._id} className="restaurant-suggestion-card rounded-xl border border-gray-200 p-4">
                        <div className="restaurant-suggestion-card__image overflow-hidden rounded-lg bg-orange-50 text-[#FF6B35]">
                          {request.image ? <img src={request.image} alt={request.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Store className="h-8 w-8" /></div>}
                        </div>
                        <div className="restaurant-suggestion-card__content">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{request.name}</h3>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${request.status === 'Pending' ? 'bg-amber-100 text-amber-700' : request.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {request.status === 'Pending' ? 'Pending' : request.status === 'Approved' ? 'Approved' : 'Rejected'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{request.tags?.join(', ') || request.cuisine || 'No tags'} · {request.address}</p>
                          {(request.openingTime || request.closingTime) && <p className="mt-1 text-xs text-gray-500">Hours: {request.openingTime || '—'}–{request.closingTime || '—'}</p>}
                          {!!request.dishes?.length && <p className="mt-1 text-xs text-gray-500">Menu: {request.dishes.map((dish) => dish.price ? `${dish.name} (${dish.price})` : dish.name).join(' · ')}</p>}
                          {!!request.tags?.length && <div className="mt-2 flex flex-wrap gap-1.5">{request.tags.map((tag) => <span key={tag} className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-[#D94E1F]">{tag}</span>)}</div>}
                          {request.description && <p className="mt-2 text-sm text-gray-700">{request.description}</p>}
                          <p className="mt-2 text-xs text-gray-500">Submitted by: {request.user?.username || request.user?.email || 'Unknown'}{request.user?.email && request.user.username ? ` (${request.user.email})` : ''} · {new Date(request.createdAt).toLocaleDateString('en-US')}</p>
                        </div>
                        {request.status === 'Pending' && (
                          <div className="restaurant-suggestion-card__actions">
                            <button disabled={requestActionId === request._id} onClick={() => handleRestaurantRequest(request, 'approve')} className="restaurant-suggestion-card__approve">
                              <Check className="h-4 w-4" /> Approve
                            </button>
                            <button disabled={requestActionId === request._id} onClick={() => handleRestaurantRequest(request, 'reject')} className="restaurant-suggestion-card__reject">
                              <X className="h-4 w-4" /> Reject
                            </button>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-gray-900">User Management</h2>
                  <button
                    onClick={fetchAdminUsers}
                    disabled={isLoadingUsers}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    {isLoadingUsers ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-700">User</th>
                        <th className="text-left py-3 px-4 text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 text-gray-700">Joined</th>
                        <th className="text-left py-3 px-4 text-gray-700">Status</th>
                        <th className="text-right py-3 px-4 text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((adminUser) => {
                        const displayName = adminUser.username || adminUser.email;
                        const isProtected = adminUser.role === 'admin' || adminUser._id === user?.id;
                        const isBusy = userActionId === adminUser._id;

                        return (
                        <tr key={adminUser._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-full flex items-center justify-center text-white">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-gray-900">{displayName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{adminUser.email}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${adminUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {adminUser.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{formatDate(adminUser.createdAt)}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${adminUser.isLocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {adminUser.isLocked ? 'Locked' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleUserLock(adminUser)}
                                disabled={isProtected || isBusy}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${adminUser.isLocked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                              >
                                {isBusy ? 'Saving...' : adminUser.isLocked ? 'Unlock' : 'Lock'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(adminUser)}
                                disabled={isProtected || isBusy}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isProtected ? 'Admin/current user cannot be deleted' : 'Delete user'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Add Restaurant Dialog */}
      {showAddDialog && (
        <div className="restaurant-modal-overlay">
          <div className="restaurant-modal restaurant-modal--admin">
            <div className="restaurant-modal__body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900 text-lg font-semibold">
                  {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
                </h2>
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Restaurant Name */}
              <div className="mb-3">
                <label className="block text-gray-700 mb-1 text-sm">Restaurant Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
                  placeholder="Enter restaurant name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <AddressFields value={addressParts} onChange={setAddressParts} requiredDistrict />
                <p className="mt-2 text-xs text-gray-500">Display address: {newAddress || 'Complete the address fields above'}</p>
              </div>

              {/* Image + District */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-gray-700 mb-1 text-sm">Restaurant Image</label>
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setShowRestaurantImageOptions((value) => !value)}
                      className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border hover:ring-2 hover:ring-[#FF6B35] transition"
                    >
                      {newImageUrl ? (
                        <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-400 text-center px-2">No image</span>
                      )}
                    </button>

                    {showRestaurantImageOptions && (
                      <div className="absolute left-20 top-0 z-20 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                      <label
                        htmlFor="restaurantImage"
                          className="inline-flex w-full items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 cursor-pointer hover:bg-gray-50"
                      >
                          Upload image
                      </label>
                      <input
                        id="restaurantImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                          onChange={(e) => {
                            handleImageChange(e);
                            setShowRestaurantImageOptions(false);
                          }}
                      />
                        <input
                          type="url"
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
                          placeholder="Paste image URL"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">Amenities (comma separated)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
                      placeholder="Wifi, Parking, ..."
                      value={newAmenities}
                      onChange={(e) => setNewAmenities(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-1 text-sm">Cuisine & Restaurant Tags <span className="text-red-500">*</span></label>
                    {availableRestaurantTags.length > 0 ? (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {availableRestaurantTags.map((tag) => {
                          const selected = newTags.includes(tag);
                          return <button key={tag} type="button" aria-pressed={selected} onClick={() => toggleRestaurantTag(tag)} className={`rounded-full border px-3 py-1 text-xs transition-colors ${selected ? 'border-[#FF6B35] bg-orange-50 text-[#D94E1F]' : 'border-gray-200 text-gray-600 hover:border-[#FF6B35]'}`}>{tag}</button>;
                        })}
                      </div>
                    ) : <p className="mb-2 text-xs text-gray-500">No existing restaurant tags yet. Add a new one below.</p>}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
                        placeholder="Add a new tag — press Enter or comma"
                        value={tagDraft}
                        onChange={(event) => setTagDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ',') {
                            event.preventDefault();
                            addRestaurantTags(tagDraft);
                          }
                        }}
                        onBlur={() => addRestaurantTags(tagDraft)}
                      />
                      <button type="button" onClick={() => addRestaurantTags(tagDraft)} className="rounded-lg border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50">Add</button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newTags.filter((tag) => !availableRestaurantTags.includes(tag)).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-[#D94E1F]">
                          {tag}
                          <button type="button" aria-label={`Remove ${tag} tag`} onClick={() => setNewTags((current) => current.filter((item) => item !== tag))} className="rounded-full hover:bg-orange-100">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Opening / Closing Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-gray-700 mb-1 text-sm">Opening Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
                    value={newOpeningTime}
                    onChange={(e) => setNewOpeningTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 text-sm">Closing Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
                    value={newClosingTime}
                    onChange={(e) => setNewClosingTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="block text-gray-700 mb-1 text-sm">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none text-sm"
                  rows={3}
                  placeholder="Describe the restaurant"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              {/* Menu (Dishes) */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Menu (Dishes)</label>

                <div className="space-y-2">
                  {menuItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row items-center gap-3 p-3 border border-gray-200 rounded-lg"
                    >
                      {/* Image + button */}
                      <div className="relative w-full md:w-auto">
                        <button
                          type="button"
                          onClick={() => setActiveDishImageOptions(activeDishImageOptions === index ? null : index)}
                          className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border shrink-0 hover:ring-2 hover:ring-[#FF6B35] transition"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt="Dish"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-gray-400 text-center px-1">
                              No image
                            </span>
                          )}
                        </button>

                        {activeDishImageOptions === index && (
                          <div className="absolute left-20 top-0 z-20 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                          <label
                            htmlFor={`dishImage-${index}`}
                              className="inline-flex w-full items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 cursor-pointer hover:bg-gray-50"
                          >
                              Upload image
                          </label>
                          <input
                            id={`dishImage-${index}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                              onChange={(e) => {
                                handleMenuItemImageChange(index, e);
                                setActiveDishImageOptions(null);
                              }}
                          />
                            <input
                              type="url"
                              placeholder="Paste image URL"
                              value={item.image || ''}
                              onChange={(e) =>
                                handleMenuItemChange(index, 'image', e.target.value)
                              }
                              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
                            />
                          </div>
                        )}
                      </div>

                      {/* Dish name */}
                      <input
                        type="text"
                        placeholder="Dish name"
                        value={item.name}
                        onChange={(e) =>
                          handleMenuItemChange(index, 'name', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
                      />

                      {/* Price */}
                      <input
                        type="text"
                        placeholder="Price (VNĐ)"
                        value={item.price}
                        onChange={(e) =>
                          handleMenuItemChange(index, 'price', e.target.value)
                        }
                        className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
                      />

                      {/* Remove row */}
                      {menuItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMenuItemRow(index)}
                          className="text-red-500 text-xs md:text-sm"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddMenuItemRow}
                  className="mt-2 text-sm text-[#FF6B35] hover:underline"
                >
                  + Add dish
                </button>
              </div>
            </div>

            <div className="restaurant-modal__footer">
              <button
                onClick={handleSaveRestaurant}
                disabled={isSaving}
                className={`flex-1 py-2.5 rounded-lg transition-colors text-sm ${isSaving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#FF6B35] text-white hover:bg-[#FF5722]'}`}
              >
                {isSaving ? 'Saving...' : (editingRestaurant ? 'Save Changes' : 'Add Restaurant')}
              </button>
              <button
                onClick={() => setShowAddDialog(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
