import React from 'react';
import { Star, Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../lib/data';

interface RestaurantCardProps {
  restaurant: Restaurant;
  vertical?: boolean;
  compact?: boolean;
}

export const RestaurantCard = ({ restaurant, vertical = true, compact = false }: RestaurantCardProps) => {
  return (
    <div className={`group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${vertical ? 'flex flex-col h-full' : 'flex flex-row h-32'}`}>
      <div className={`relative overflow-hidden ${vertical ? 'h-48 w-full' : 'w-32 h-full shrink-0'}`}>
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm">
          <Heart className="w-4 h-4" />
        </button>
        
        {restaurant.openNow && vertical && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider rounded">
            Open Now
          </span>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-slate-800 group-hover:text-[#FF6B35] transition-colors line-clamp-1">{restaurant.name}</h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700 text-xs font-bold">
              <span>{restaurant.rating}</span>
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            </div>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <span className="font-medium text-slate-700">{restaurant.priceRange}</span>
            <span className="mx-1.5">•</span>
            <span className="line-clamp-1">{restaurant.tags[0]}, {restaurant.tags[1]}</span>
          </div>

          {!compact && (
             <div className="flex items-center text-xs text-gray-400 mb-3">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="line-clamp-1">{restaurant.address}</span>
            </div>
          )}
        </div>

        {!compact && (
          <div className="flex gap-2 mt-auto">
             {restaurant.tags.slice(0, 2).map(tag => (
               <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-full font-medium">{tag}</span>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
