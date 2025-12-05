import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, Star, TrendingUp, Search, Edit, Trash2, Check, X, Plus, BarChart3, LogOut, ChevronDown, User } from 'lucide-react';
import { restaurants, tours } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'users' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock admin stats
  const stats = {
    totalUsers: 1247,
    totalRestaurants: restaurants.length,
    totalReviews: 8542,
    activeTours: tours.length,
    newUsersThisWeek: 124,
    newReviewsThisWeek: 342,
    pendingApprovals: 5
  };

  const [restaurantList, setRestaurantList] = useState(restaurants);

  const filteredRestaurants = restaurantList.filter(r =>
    searchQuery === '' || r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteRestaurant = (id: string) => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      setRestaurantList(prev => prev.filter(r => r.id !== id));
    }
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
              <span className="text-orange-600 text-sm">{stats.pendingApprovals} pending</span>
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
                className={`px-6 py-4 whitespace-nowrap transition-colors ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-[#FF6B35] text-[#FF6B35]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('restaurants')}
                className={`px-6 py-4 whitespace-nowrap transition-colors ${
                  activeTab === 'restaurants'
                    ? 'border-b-2 border-[#FF6B35] text-[#FF6B35]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Store className="w-5 h-5 inline mr-2" />
                Restaurants
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 whitespace-nowrap transition-colors ${
                  activeTab === 'users'
                    ? 'border-b-2 border-[#FF6B35] text-[#FF6B35]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 whitespace-nowrap transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-b-2 border-[#FF6B35] text-[#FF6B35]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-5 h-5 inline mr-2" />
                Analytics
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
                      { action: 'Restaurant pending approval', name: 'Bún Bò Huế An Phú', time: '2 hours ago', type: 'pending' }
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
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
                    {restaurants.slice(0, 5).map((restaurant, idx) => (
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
                            <span>{restaurant.reviews} reviews</span>
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
                    onClick={() => setShowAddDialog(true)}
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
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              restaurant.isOpen
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {restaurant.isOpen ? 'Open' : 'Closed'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
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
                <h2 className="text-gray-900 mb-6">User Management</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-700">User</th>
                        <th className="text-left py-3 px-4 text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 text-gray-700">Joined</th>
                        <th className="text-left py-3 px-4 text-gray-700">Activity</th>
                        <th className="text-right py-3 px-4 text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 1, name: 'Alex Johnson', email: 'alex@example.com', joined: '2025-01-15', tours: 5, reviews: 12 },
                        { id: 2, name: 'Sarah Williams', email: 'sarah@example.com', joined: '2025-02-20', tours: 3, reviews: 8 },
                        { id: 3, name: 'Mike Chen', email: 'mike@example.com', joined: '2025-03-10', tours: 7, reviews: 15 },
                      ].map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-full flex items-center justify-center text-white">
                                {user.name.charAt(0)}
                              </div>
                              <span className="text-gray-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{user.email}</td>
                          <td className="py-4 px-4 text-gray-600">{user.joined}</td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-600">
                              {user.tours} tours • {user.reviews} reviews
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                                Active
                              </button>
                              <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                                Block
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

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-gray-900 mb-4">New User Growth</h2>
                  <div className="bg-gray-50 rounded-xl p-8 h-64 flex items-end justify-around gap-2">
                    {[45, 62, 58, 71, 84, 95, 124].map((value, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-[#FF6B35] to-[#FF8C61] rounded-t-lg transition-all hover:opacity-80"
                          style={{ height: `${(value / 124) * 100}%` }}
                        />
                        <span className="text-xs text-gray-600">W{idx + 2}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-gray-900 mb-4">Popular Cuisines</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Vietnamese', percentage: 85 },
                        { name: 'Bánh mì', percentage: 72 },
                        { name: 'Coffee', percentage: 68 },
                        { name: 'Seafood', percentage: 54 },
                        { name: 'Noodles', percentage: 45 }
                      ].map((cuisine) => (
                        <div key={cuisine.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-700">{cuisine.name}</span>
                            <span className="text-gray-600">{cuisine.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#FF6B35] h-2 rounded-full transition-all"
                              style={{ width: `${cuisine.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-gray-900 mb-4">Top Search Districts</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'District 1', count: 3254 },
                        { name: 'District 3', count: 2187 },
                        { name: 'District 4', count: 1843 },
                        { name: 'District 5', count: 1562 },
                        { name: 'District 7', count: 1423 }
                      ].map((district, idx) => (
                        <div key={district.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-lg text-gray-400">#{idx + 1}</span>
                            <span className="text-gray-900">{district.name}</span>
                          </div>
                          <span className="text-[#FF6B35]">{district.count.toLocaleString()} searches</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Restaurant Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">Add New Restaurant</h2>
              <button
                onClick={() => setShowAddDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Restaurant Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  placeholder="Enter restaurant name"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  placeholder="Enter full address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Opening Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Closing Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none"
                  rows={4}
                  placeholder="Describe the restaurant"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1 bg-[#FF6B35] text-white py-3 rounded-lg hover:bg-[#FF5722] transition-colors"
                >
                  Add Restaurant
                </button>
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}