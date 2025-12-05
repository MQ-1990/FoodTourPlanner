import React, { useState } from 'react';
import { Settings, Award, Map, Heart, Edit2, Check, X, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TourCard } from '../components/TourCard';
import { RestaurantCard } from '../components/RestaurantCard';
import { MOCK_TOURS, MOCK_RESTAURANTS } from '../lib/data';
import * as Tabs from '@radix-ui/react-tabs';
import { toast } from 'sonner@2.0.3';

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Alex Nguyen');
  const [bio, setBio] = useState('Foodie • Explorer • Coffee Addict');
  const [tempName, setTempName] = useState(name);
  const [tempBio, setTempBio] = useState(bio);

  // Preferences state
  const [selectedPreferences, setSelectedPreferences] = useState(['Món cay', 'Hải sản', 'Cà phê']);
  const [selectedPriceRange, setSelectedPriceRange] = useState('100,000 - 300,000đ');
  const [selectedArea, setSelectedArea] = useState('Quận 1, TP HCM');

  const handleSaveProfile = () => {
    setName(tempName);
    setBio(tempBio);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setTempName(name);
    setTempBio(bio);
    setIsEditing(false);
  };

  const preferences = ['Món cay', 'Món ngọt', 'Hải sản', 'Cà phê', 'Trà sữa', 'Chay', 'Đồ nướng', 'Phở', 'Bún'];
  const priceRanges = ['< 50,000đ', '50,000 - 100,000đ', '100,000 - 300,000đ', '300,000 - 500,000đ', '> 500,000đ'];

  const togglePreference = (pref: string) => {
    setSelectedPreferences(prev => 
      prev.includes(pref) 
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 pb-8 pt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 p-1 border-4 border-white shadow-lg">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" className="w-full h-full rounded-full object-cover" />
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
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors"
                      >
                        <Check className="w-4 h-4" /> Save
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
                    <p className="text-slate-500 mb-4">{bio}</p>
                  </>
                )}
                
                {!isEditing && (
                  <>
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm mb-4">
                       <div className="text-center">
                          <span className="block font-bold text-slate-800 text-lg">12</span>
                          <span className="text-gray-400">Reviews</span>
                       </div>
                       <div className="text-center">
                          <span className="block font-bold text-slate-800 text-lg">5</span>
                          <span className="text-gray-400">Tours Created</span>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                       {selectedPreferences.slice(0, 4).map(tag => (
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
                 {MOCK_TOURS.map(tour => (
                   <div key={tour.id} className="h-full">
                     <TourCard tour={tour} />
                   </div>
                 ))}
               </div>
            </Tabs.Content>

            <Tabs.Content value="favorites" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {MOCK_RESTAURANTS.map(r => (
                    <Link key={r.id} to={`/restaurant/${r.id}`}>
                      <RestaurantCard restaurant={r} />
                    </Link>
                  ))}
               </div>
            </Tabs.Content>

            <Tabs.Content value="preferences" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="max-w-2xl bg-white rounded-xl p-8 shadow-sm">
                 <h2 className="text-xl font-bold text-slate-800 mb-6">Food Preferences</h2>
                 
                 {/* Taste Preferences */}
                 <div className="mb-8">
                   <label className="block font-medium text-gray-700 mb-3">
                     What do you like? (Khẩu vị yêu thích)
                   </label>
                   <div className="flex flex-wrap gap-2">
                     {preferences.map(pref => (
                       <button
                         key={pref}
                         onClick={() => togglePreference(pref)}
                         className={`px-4 py-2 rounded-lg border transition-colors ${
                           selectedPreferences.includes(pref)
                             ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                             : 'bg-white text-gray-700 border-gray-300 hover:border-[#FF6B35]'
                         }`}
                       >
                         {pref}
                       </button>
                     ))}
                   </div>
                 </div>

                 {/* Price Range */}
                 <div className="mb-8">
                   <label className="block font-medium text-gray-700 mb-3">
                     Price Range (Ngân sách trung bình)
                   </label>
                   <select
                     value={selectedPriceRange}
                     onChange={(e) => setSelectedPriceRange(e.target.value)}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                   >
                     {priceRanges.map(range => (
                       <option key={range} value={range}>{range}</option>
                     ))}
                   </select>
                 </div>

                 {/* Preferred Area */}
                 <div className="mb-8">
                   <label className="block font-medium text-gray-700 mb-3">
                     Preferred Area (Khu vực thường xuyên)
                   </label>
                   <input
                     type="text"
                     value={selectedArea}
                     onChange={(e) => setSelectedArea(e.target.value)}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                     placeholder="e.g., Quận 1, TP HCM"
                   />
                 </div>

                 {/* Save Button */}
                 <button
                   onClick={() => toast.success('Preferences saved successfully!')}
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