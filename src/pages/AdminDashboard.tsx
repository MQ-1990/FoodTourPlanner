import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, Star, TrendingUp, Search, Edit, Trash2, Check, X, Plus, BarChart3, LogOut, ChevronDown, User } from 'lucide-react';
// import { restaurants, tours } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
const API_URL = 'http://localhost:5000';



type MenuItem = {
  name: string;
  price: string;
  image?: string;
};

type DbUser = {
  _id: string;
  email: string;
  username?: string;
  role: 'admin' | 'user';
  createdAt: string;
  isLocked?: boolean;
  avatar?: string;
};
type Activity = {
  type: "user" | "restaurant";
  action: string;
  name: string;
  createdAt?: string;
  image?: string;
};

type RestaurantDish = {
  id?: number;
  name: string;
  price: string;
  image?: string;
};

type Restaurant = {
  _id?: string;          // mongo id (có thể có hoặc không tùy API trả)
  id: number;            // id số bạn tự tăng trong schema
  name: string;
  address?: string;
  district?: string;
  rating?: number;
  priceRange?: "$" | "$$" | "$$$" | "$$$$" | "$$$$$";
  image?: string;
  description?: string;
  phone?: string;
  tags?: string[];       // hoặc TagOption[] nếu muốn strict
  openingTime?: string;  // "09:00"
  closingTime?: string;  // "22:00"
  dishes?: RestaurantDish[];
  createdAt?: string;    // timestamps: true
  updatedAt?: string;
};

const uploadImageToS3 = async (file: File): Promise<string> => {
  const presignedRes = await fetch(`${API_URL}/api/upload/presigned-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
    }),
  });

  if (!presignedRes.ok) {
    throw new Error('Create presigned URL failed');
  }

  const { uploadUrl, imageUrl } = await presignedRes.json();
  console.log("S3 imageUrl:", imageUrl);
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Upload image to S3 failed');
  }

  // 3. Trả URL để lưu MongoDB
  return imageUrl as string;
};

const TAG_OPTIONS = ["Any", "Vietnamese", "Street Food", "Drinks", "Seafood", "Hotpot & BBQ"] as const;
type TagOption = (typeof TAG_OPTIONS)[number];



export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'tours' | 'users'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const normalizeUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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


  const [restaurantList, setRestaurantList] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<DbUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [overrideActivities, setOverrideActivities] = useState<Activity[]>([]);
  const pushActivity = (activity: Activity) => {
    setOverrideActivities((prev) => [activity, ...prev].slice(0, 5));
  };
  useEffect(() => {
    const userActivities: Activity[] = users.map((u) => ({
      type: "user",
      action: "New user registered",
      name: u.username || u.email,
      createdAt: u.createdAt,
    }));

    const restaurantActivities: Activity[] = restaurantList
      .filter((r: any) => r.createdAt)
      .map((r: any) => ({
        type: "restaurant",
        action: "New restaurant added",
        name: r.name,
        createdAt: r.createdAt,
        image: r.image,
      }));

    const base = [...userActivities, ...restaurantActivities].filter((a) => a.createdAt);

    base.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    // merge override + base, tránh trùng (dựa trên action+name+createdAt)
    const merged = [...overrideActivities, ...base].filter((a, idx, arr) => {
      const key = `${a.type}|${a.action}|${a.name}|${a.createdAt}`;
      return idx === arr.findIndex((x) => `${x.type}|${x.action}|${x.name}|${x.createdAt}` === key);
    });

    setRecentActivities(merged.slice(0, 5));
  }, [users, restaurantList, overrideActivities]);
  const totalUsers = users.length;
  const totalRestaurants = restaurantList.length;




  const totalReviews = restaurantList.reduce((sum: number, r: any) => {
    if (Array.isArray(r.reviews)) return sum + r.reviews.length;
    if (typeof r.reviewCount === 'number') return sum + r.reviewCount;
    return sum;
  }, 0);

  const activeTours = 0;

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch(`${API_URL}/api/restaurants`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRestaurantList(data);
      } catch (err) {
        console.warn('Không lấy được restaurants từ BE, dùng mockData.', err);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const res = await fetch(`${API_URL}/api/users`);
        if (!res.ok) throw new Error('Cannot fetch users');
        const data: DbUser[] = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Không lấy được users từ BE', err);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatTimeAgo = (iso?: string) => {
    if (!iso) return '';
    const created = new Date(iso).getTime();
    if (Number.isNaN(created)) return '';

    const diffMs = Date.now() - created;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} minutes ago`;

    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} hours ago`;

    const diffD = Math.floor(diffH / 24);
    return `${diffD} days ago`;
  };

  const isRestaurantOpenNow = (opening?: string, closing?: string) => {
    if (!opening || !closing) return true;

    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
      return h * 60 + m;
    };

    const openM = toMinutes(opening);
    const closeM = toMinutes(closing);
    if (Number.isNaN(openM) || Number.isNaN(closeM)) return true;

    const now = new Date();
    const nowM = now.getHours() * 60 + now.getMinutes();

    // cùng ngày: 08:00 -> 22:00
    if (openM < closeM) return nowM >= openM && nowM < closeM;

    // qua đêm: 18:00 -> 02:00
    return nowM >= openM || nowM < closeM;
  };

  // Form state for Add Restaurant
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newOpeningTime, setNewOpeningTime] = useState('');
  const [newClosingTime, setNewClosingTime] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newPriceRange, setNewPriceRange] = useState('$$');
  const [newTags, setNewTags] = useState<TagOption[]>(["Any"]);
  const [newPhone, setNewPhone] = useState('');
  const [editingRestaurant, setEditingRestaurant] = useState<any | null>(null);


  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { name: '', price: '', image: '' },
  ]);

  // Mở modal ở chế độ ADD – reset form
  const openAddDialog = () => {
    setEditingRestaurant(null);

    setNewName('');
    setNewAddress('');
    setNewOpeningTime('');
    setNewClosingTime('');
    setNewDescription('');
    setNewImageUrl('');
    setNewDistrict('');
    setNewPriceRange('$$');
    setNewTags(["Any"]);
    setNewPhone('');
    setMenuItems([{ name: '', price: '', image: '' }]);

    setShowAddDialog(true);
  };



  // Mở modal ở chế độ EDIT – fill form từ restaurant
  const openEditDialog = (restaurant: any) => {
    setEditingRestaurant(restaurant);

    setNewName(restaurant.name || '');
    setNewAddress(restaurant.address || '');
    setNewOpeningTime(restaurant.openingTime || '');
    setNewClosingTime(restaurant.closingTime || '');
    setNewDescription(restaurant.description || '');
    setNewImageUrl(restaurant.image || '');
    setNewDistrict(restaurant.district || '');
    setNewPriceRange(restaurant.priceRange || '$$');
    setNewTags(
      (Array.isArray(restaurant.tags) && restaurant.tags.length ? restaurant.tags : ["Any"]) as TagOption[]
    );
    setNewPhone(restaurant.phone || '');

    // LẤY TỪ dishes (BE) chứ không phải menu
    setMenuItems(
      restaurant.dishes && restaurant.dishes.length
        ? restaurant.dishes.map((d: any) => ({
          name: d.name || '',
          price: String(d.price ?? ''),
          image: d.image || '',
        }))
        : [{ name: '', price: '', image: '' }]
    );

    // cuối cùng mở modal
    setShowAddDialog(true);
  };

  const toggleTag = (tag: TagOption) => {
    setNewTags((prev) => {
      const exists = prev.includes(tag);

      // click để bỏ
      let next = exists ? prev.filter((t) => t !== tag) : [...prev, tag];

      // xử lý "Any"
      if (tag === "Any" && !exists) {
        next = ["Any"];
      } else {
        // nếu chọn tag khác thì remove Any
        next = next.filter((t) => t !== "Any");
        // nếu không còn tag nào thì fallback Any
        if (next.length === 0) next = ["Any"];
      }

      return next as TagOption[];
    });
  };



  const handleMenuItemChange = (
    index: number,
    field: 'name' | 'price',
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

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToS3(file);
      setNewImageUrl(uploadedUrl); // URL thật, ví dụ http://localhost:5000/uploads/xxx.jpg
    } catch (err) {
      console.error(err);
      alert('Upload ảnh nhà hàng thất bại');
    }
  };

  const handleMenuItemImageChange = async (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageToS3(file);

      setMenuItems((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], image: uploadedUrl };
        return copy;
      });
    } catch (err) {
      console.error(err);
      alert('Upload ảnh món ăn thất bại');
    }
  };

  const handleSaveRestaurant = async () => {
    if (!newName.trim()) {
      alert("Please enter restaurant name");
      return;
    }

    const cleanedMenu = menuItems.filter(
      (item) => item.name.trim() && item.price.trim()
    );

    try {
      if (editingRestaurant) {
        // ===== EDIT =====
        const payload = {
          name: newName,
          address: newAddress,
          district: newDistrict || "Quận 1",
          image:
            newImageUrl ||
            editingRestaurant.image ||
            "https://via.placeholder.com/150",
          openingTime: newOpeningTime,
          closingTime: newClosingTime,
          description: newDescription,
          priceRange: newPriceRange,
          tags: newTags,
          phone: newPhone,
          dishes: cleanedMenu.map((item) => ({
            name: item.name,
            price: item.price,
            image: item.image || "",
          })),
        };

        const res = await fetch(
          `${API_URL}/api/restaurants/${editingRestaurant.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert((data as any)?.message || "Lỗi server");
          return;
        }

        // ✅ IMPORTANT: refresh list từ BE để rating không bị reset
        const resList = await fetch(`${API_URL}/api/restaurants`);
        const list = await resList.json().catch(() => []);
        if (resList.ok && Array.isArray(list)) {
          setRestaurantList(list);
        }
        pushActivity({
          type: "restaurant",
          action: "Restaurant updated",
          name: newName,
          createdAt: new Date().toISOString(),
          image: newImageUrl || editingRestaurant.image,
        });

      } else {
        // ===== ADD =====
        const payload = {
          name: newName,
          address: newAddress,
          district: newDistrict || "Quận 1",
          image: newImageUrl || "https://via.placeholder.com/150",
          openingTime: newOpeningTime,
          closingTime: newClosingTime,
          description: newDescription,
          priceRange: newPriceRange,
          tags: newTags,
          phone: newPhone,
          dishes: cleanedMenu.map((item) => ({
            name: item.name,
            price: item.price,
            image: item.image || "",
          })),
        };

        const res = await fetch(`${API_URL}/api/restaurants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert((data as any)?.message || "Lỗi server");
          return;
        }

        // ✅ ADD: ưu tiên push item mới lên đầu
        setRestaurantList((prev) => [data as any, ...prev]);
      }

      // ===== CLOSE MODAL + RESET FORM =====
      setShowAddDialog(false);
      setEditingRestaurant(null);

      setNewName("");
      setNewAddress("");
      setNewOpeningTime("");
      setNewClosingTime("");
      setNewDescription("");
      setNewImageUrl("");
      setNewDistrict("");
      setNewPriceRange("$$");
      setNewTags(["Any"]);
      setNewPhone("");
      setMenuItems([{ name: "", price: "", image: "" }]);
    } catch (err) {
      console.error(err);
      alert("Không kết nối được server");
    }
  };



  const filteredRestaurants = restaurantList.filter(r =>
    searchQuery === '' || r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUsers = users.filter((u) => {
    if (userSearchQuery.trim() === '') return true;

    const q = userSearchQuery.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const username = (u.username || '').toLowerCase();

    return email.includes(q) || username.includes(q);
  });

  const handleDeleteRestaurant = async (id: number) => {
    const ok = confirm('Are you sure you want to delete this restaurant?');
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/api/restaurants/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Lỗi server khi xoá nhà hàng');
        return;
      }



      setRestaurantList(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Không kết nối được server');
    }
  };

  const handleDeleteUser = async (id: string) => {
    const ok = confirm('Delete this user?');
    if (!ok) return;
    const target = users.find((u) => u._id === id);

    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Lỗi server khi xoá user');
        return;
      }
      setUsers(prev => prev.filter(u => u._id !== id));
      pushActivity({
        type: "user",
        action: "User deleted",
        name: target?.username || target?.email || id,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      alert('Không kết nối được server');
    }
  };
  const handleLockUser = async (id: string) => {
    const ok = confirm('Lock this user?');
    if (!ok) return;
    const target = users.find((u) => u._id === id);

    try {
      const res = await fetch(`${API_URL}/api/users/${id}/lock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || 'Lỗi server khi khoá user');
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isLocked: true } : u))

      );
      pushActivity({
        type: "user",
        action: "User locked",
        name: target?.username || target?.email || id,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      alert('Không kết nối được server');
    }
  };

  const handleUnlockUser = async (id: string) => {
    const ok = confirm('Unlock this user?');
    if (!ok) return;
    const target = users.find((u) => u._id === id);

    try {
      const res = await fetch(`${API_URL}/api/users/${id}/unlock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || 'Lỗi server khi mở khoá user');
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isLocked: false } : u))
      );
      pushActivity({
        type: "user",
        action: "User unlocked",
        name: target?.username || target?.email || id,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      alert('Không kết nối được server');
    }
  };

  const popularRestaurants = restaurantList
    .map((r) => r)
    .sort((a: any, b: any) => {
      // so sánh rating trước
      const ratingA = typeof a.rating === 'number' ? a.rating : 0;
      const ratingB = typeof b.rating === 'number' ? b.rating : 0;

      if (ratingB !== ratingA) {
        return ratingB - ratingA; // rating cao hơn đứng trước
      }

      // nếu rating bằng nhau → so sánh số review
      const reviewsA = Array.isArray(a.reviews)
        ? a.reviews.length
        : typeof a.reviewCount === 'number'
          ? a.reviewCount
          : 0;

      const reviewsB = Array.isArray(b.reviews)
        ? b.reviews.length
        : typeof b.reviewCount === 'number'
          ? b.reviewCount
          : 0;

      return reviewsB - reviewsA;
    })
    .slice(0, 5);

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
            </div>
            <h3 className="text-2xl text-gray-900 mb-1">
              {totalUsers.toLocaleString()}
            </h3>
            <p className="text-gray-600 text-sm">Total Users</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Store className="w-6 h-6 text-orange-600" />
              </div>

            </div>
            <h3 className="text-2xl text-gray-900 mb-1">{totalRestaurants}</h3>
            <p className="text-gray-600 text-sm">Restaurants</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-2xl text-gray-900 mb-1">
              {totalReviews.toLocaleString()}
            </h3>
            <p className="text-gray-600 text-sm">Reviews</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl text-gray-900 mb-1">{activeTours}</h3>
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
                onClick={() => setActiveTab('tours')}
                className={`px-6 py-4 whitespace-nowrap transition-colors ${activeTab === 'tours'
                  ? 'border-b-2 border-[#FF6B35] text-[#FF6B35]'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <TrendingUp className="w-5 h-5 inline mr-2" />
                Food Tours
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

            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-gray-900 mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    <div className="space-y-3">
                      {recentActivities.length === 0 ? (
                        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                          No recent activity.
                        </div>
                      ) : (
                        recentActivities.map((activity, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {activity.type === "restaurant" && activity.image ? (
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                                  <img
                                    src={activity.image}
                                    alt={activity.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div
                                  className={
                                    "w-10 h-10 rounded-full flex items-center justify-center " +
                                    (activity.type === "user"
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-orange-100 text-orange-600")
                                  }
                                >
                                  {activity.type === "user" ? (
                                    <Users className="w-5 h-5" />
                                  ) : (
                                    <Store className="w-5 h-5" />
                                  )}
                                </div>
                              )}

                              <div>
                                <p className="text-gray-900">{activity.action}</p>
                                <p className="text-sm text-gray-600">{activity.name}</p>
                              </div>
                            </div>

                            <span className="text-sm text-gray-500">
                              {formatTimeAgo(activity.createdAt)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                </div>

                <div>
                  <h2 className="text-gray-900 mb-4">Most Popular Restaurants</h2>
                  <div className="space-y-3">
                    {popularRestaurants.map((restaurant, idx) => (
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
                            <span>
                              {Array.isArray((restaurant as any).reviews)
                                ? (restaurant as any).reviews.length
                                : (restaurant as any).reviewCount ?? 0}{' '}
                              reviews
                            </span>
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
                                {/* dùng tags thay cho cuisine */}
                                <p className="text-sm text-gray-600">
                                  {restaurant.tags && restaurant.tags.length > 0
                                    ? restaurant.tags.join(', ')
                                    : ''}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Location (district) */}
                          <td className="py-4 px-4 text-gray-600">{restaurant.district}</td>

                          {/* Rating + reviewCount */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-gray-900">{restaurant.rating ?? 0}</span>
                              <span className="text-gray-500 text-sm">
                              </span>
                            </div>
                          </td>

                          {/* Status – tạm thời luôn Open */}
                          <td className="py-4 px-4">
                            {(() => {
                              const openNow = isRestaurantOpenNow(restaurant.openingTime, restaurant.closingTime);

                              return openNow ? (
                                <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                  Open
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">
                                  Closed
                                </span>
                              );
                            })()}
                          </td>

                          {/* Actions */}
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
            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-gray-900">User Management</h2>

                  <div className="flex-1 max-w-md flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users by email or username..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="flex-1 outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-700">User</th>
                        <th className="text-left py-3 px-4 text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 text-gray-700">Joined</th>
                        <th className="text-left py-3 px-4 text-gray-700">Status</th>
                        <th className="text-right py-3 px-4 text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading && (
                        <tr>
                          <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                            Loading users...
                          </td>
                        </tr>
                      )}

                      {!usersLoading && filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                            No users found.
                          </td>
                        </tr>
                      )}

                      {!usersLoading &&
                        filteredUsers.map((u) => (
                          <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                            {/* User */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                {u.avatar ? (
                                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                                    <img
                                      src={normalizeUrl(u.avatar)}
                                      alt={u.username || u.email}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-full flex items-center justify-center text-white">
                                    {(u.username || u.email).charAt(0).toUpperCase()}
                                  </div>
                                )}

                                <span className="text-gray-900">{u.username || "(no username)"}</span>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="py-4 px-4 text-gray-600">{u.email}</td>

                            {/* Joined */}
                            <td className="py-4 px-4 text-gray-600">
                              {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                            </td>

                            {/* Status (NEW) */}
                            <td className="py-4 px-4">
                              {u.isLocked ? (
                                <span className="px-3 py-1 rounded-full text-xs bg-gray-200 text-gray-700">
                                  Locked
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                  Active
                                </span>
                              )}
                            </td>

                            {/* Actions (Lock/Unlock + Delete) */}
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                {u.isLocked ? (
                                  <button
                                    onClick={() => handleUnlockUser(u._id)}
                                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                  >
                                    Unlock
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleLockUser(u._id)}
                                    className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                  >
                                    Lock
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                  Delete
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



          </div>
        </div>
      </div>

      {/* Add Restaurant Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 p-4 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">

              <div className="px-6 py-4 border-b bg-white shrink-0">
                <div className="flex items-center justify-between">
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
              </div>

              {/* BODY (scroll only here) */}
              <div className="p-6 overflow-y-auto flex-1">
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

                {/* Address + District cùng hàng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">Address</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
                      placeholder="Enter full address"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">District</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
                      placeholder="Quận 1"
                      value={newDistrict}
                      onChange={(e) => setNewDistrict(e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1 text-sm">Phone</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
                    placeholder="+84 90 123 4567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>

                {/* Image + PriceRange + Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* Image */}
                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">Restaurant Image</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {newImageUrl ? (
                          <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-gray-400 text-center px-2">No image</span>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="restaurantImage"
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                        >
                          Choose image
                        </label>
                        <input
                          id="restaurantImage"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* PriceRange + Tags */}
                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">Price Range</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm mb-3"
                      value={newPriceRange}
                      onChange={(e) => setNewPriceRange(e.target.value)}
                    >
                      <option value="$">$</option>
                      <option value="$$">$$</option>
                      <option value="$$$">$$$</option>
                      <option value="$$$$">$$$$</option>
                      <option value="$$$$$">$$$$$</option>
                    </select>

                    <label className="block text-gray-700 mb-1 text-sm">Tags (Cuisine)</label>
                    <div className="flex flex-wrap gap-2">
                      {TAG_OPTIONS.map((tag) => {
                        const active = newTags.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${active
                              ? "bg-[#FF6B35] text-white border-[#FF6B35]"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
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
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border shrink-0">
                            {item.image ? (
                              <img src={item.image} alt="Dish" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-gray-400 text-center px-1">No image</span>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor={`dishImage-${index}`}
                              className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                            >
                              Choose image
                            </label>
                            <input
                              id={`dishImage-${index}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleMenuItemImageChange(index, e)}
                            />
                          </div>
                        </div>

                        {/* Dish name */}
                        <input
                          type="text"
                          placeholder="Dish name"
                          value={item.name}
                          onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
                        />

                        {/* Price */}
                        <input
                          type="text"
                          placeholder="Price (USD)"
                          value={item.price}
                          onChange={(e) => handleMenuItemChange(index, 'price', e.target.value)}
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

              {/* FOOTER (fixed) */}
              <div className="border-t px-6 py-4 bg-white shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveRestaurant}
                    className="flex-1 bg-[#FF6B35] text-white py-2.5 rounded-lg hover:bg-[#FF5722] transition-colors text-sm"
                  >
                    {editingRestaurant ? 'Save Changes' : 'Add Restaurant'}
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
          </div>
        </div>
      )}

    </div>
  );
}
