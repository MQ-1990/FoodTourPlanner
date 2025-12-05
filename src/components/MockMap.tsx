import React from 'react';
import { MapPin } from 'lucide-react';
import { Restaurant } from '../lib/data';

interface MockMapProps {
  restaurants?: Restaurant[];
  highlightedId?: string;
  className?: string;
  center?: { x: number, y: number }; // For planner
  zoom?: number;
  path?: { x: number, y: number }[]; // Array of percentages for drawing a line
}

export const MockMap = ({ restaurants = [], highlightedId, className = "", path }: MockMapProps) => {
  return (
    <div className={`relative bg-[#E5F0F2] overflow-hidden ${className}`}>
      {/* Fake map grid/streets */}
      <div className="absolute inset-0 opacity-30" 
           style={{ 
             backgroundImage: 'radial-gradient(#2E86AB 1px, transparent 1px), linear-gradient(#f0f0f0 2px, transparent 2px), linear-gradient(90deg, #f0f0f0 2px, transparent 2px)',
             backgroundSize: '20px 20px, 100px 100px, 100px 100px' 
           }} 
      />
      
      {/* Fake River */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#a3d5e6] opacity-50 transform skew-x-12 translate-x-20" />

      {/* Drawn Path for Planner */}
      {path && path.length > 1 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <polyline 
            points={path.map(p => `${p.x}%,${p.y}%`).join(' ')}
            fill="none"
            stroke="#FF6B35"
            strokeWidth="4"
            strokeDasharray="8 4"
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>
      )}

      {/* Pins */}
      {restaurants.map((r) => (
        <div 
          key={r.id}
          className={`absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 cursor-pointer z-20`}
          style={{ left: `${r.lat}%`, top: `${r.lng}%` }}
        >
           <div className={`relative flex flex-col items-center ${highlightedId === r.id ? 'scale-125 z-50' : 'hover:scale-110 z-20'}`}>
              <div className={`px-2 py-1 rounded shadow-md text-xs font-bold whitespace-nowrap mb-1 ${highlightedId === r.id ? 'bg-[#FF6B35] text-white' : 'bg-white text-slate-800'}`}>
                {r.priceRange}
              </div>
              <MapPin className={`w-8 h-8 drop-shadow-lg ${highlightedId === r.id ? 'text-[#FF6B35] fill-[#FF6B35]' : 'text-[#2E86AB] fill-white'}`} />
           </div>
        </div>
      ))}

      {/* You are here marker (fake) */}
      <div className="absolute bottom-8 right-8 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50">
         <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white ring-2 ring-blue-200" />
      </div>
    </div>
  );
};
