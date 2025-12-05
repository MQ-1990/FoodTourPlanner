import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Map, ArrowRight } from 'lucide-react';
import { Tour } from '../lib/data';

interface TourCardProps {
  tour: Tour;
}

export const TourCard = ({ tour }: TourCardProps) => {
  return (
    <Link 
      to={`/tour/${tour.id}`}
      className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all h-full block"
    >
       <div className="relative h-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img 
          src={tour.image} 
          alt={tour.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-3 left-3 z-20 text-white">
           <h3 className="font-bold text-lg leading-tight mb-1">{tour.title}</h3>
           <div className="flex items-center gap-3 text-xs opacity-90">
             <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tour.duration}</span>
             <span className="flex items-center gap-1"><Map className="w-3 h-3" /> {tour.distance}</span>
           </div>
        </div>
      </div>
      <div className="p-3 flex items-center justify-between bg-white">
        <div className="flex items-center gap-1">
           <div className="flex -space-x-2">
             {[1,2,3].map(i => (
               <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[8px] overflow-hidden">
                 <img src={`https://i.pravatar.cc/150?u=${tour.id}${i}`} alt="User" />
               </div>
             ))}
           </div>
           <span className="text-xs text-gray-500 ml-2">{tour.stops} stops</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center group-hover:bg-[#FF6B35] group-hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
};