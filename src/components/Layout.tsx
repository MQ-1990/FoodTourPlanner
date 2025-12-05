import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Search, Menu, User, Heart, Map as MapIcon, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/login');
  };
  
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center">
            <MapPin className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">CityFoodTour</span>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-4">
          <Link 
            to="/planner" 
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#e55a2b] transition-colors shadow-sm"
          >
            <MapIcon className="w-4 h-4" />
            Plan Your Itinerary
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User" className="w-full h-full object-cover" />
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/planner"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MapIcon className="w-4 h-4" />
                    <span>My Tours</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Favorites</span>
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e55a2b] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
             <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-[#FF6B35] rounded flex items-center justify-center">
                  <MapPin className="text-white w-3 h-3" />
                </div>
                <span className="text-lg font-bold text-slate-800">CityFoodTour</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Discover the best local food, plan your culinary adventures, and share your tasty journeys with the world.
              </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Discover</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#FF6B35]">Trending</a></li>
              <li><a href="#" className="hover:text-[#FF6B35]">New Arrivals</a></li>
              <li><a href="#" className="hover:text-[#FF6B35]">Editors' Choice</a></li>
            </ul>
          </div>

           <div>
            <h3 className="font-semibold text-slate-800 mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#FF6B35]">Reviews</a></li>
              <li><a href="#" className="hover:text-[#FF6B35]">Tour Guides</a></li>
              <li><a href="#" className="hover:text-[#FF6B35]">Blog</a></li>
            </ul>
          </div>

           <div>
            <h3 className="font-semibold text-slate-800 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#FF6B35]">Privacy</a></li>
              <li><a href="#" className="hover:text-[#FF6B35]">Terms</a></li>
              <li><a href="#" className="hover:text-[#FF6B35]">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
          © 2025 CityFoodTour. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-slate-800 selection:bg-[#FF6B35]/20">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};