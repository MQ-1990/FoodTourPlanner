import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Coffee, UtensilsCrossed, Pizza, Beer } from 'lucide-react';
import { motion } from 'motion/react';
import Slider from 'react-slick';
import { RestaurantCard } from '../components/RestaurantCard';
import { TourCard } from '../components/TourCard';
import { MOCK_RESTAURANTS, MOCK_TOURS } from '../lib/data';

const SlickStyles = () => (
  <style>{`
    .slick-slider {
      position: relative;
      display: block;
      box-sizing: border-box;
      user-select: none;
      touch-action: pan-y;
      -webkit-tap-highlight-color: transparent;
    }
    .slick-list {
      position: relative;
      display: block;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }
    .slick-list:focus {
      outline: none;
    }
    .slick-list.dragging {
      cursor: hand;
    }
    .slick-slider .slick-track,
    .slick-slider .slick-list {
      transform: translate3d(0, 0, 0);
    }
    .slick-track {
      position: relative;
      top: 0;
      left: 0;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    .slick-track:before,
    .slick-track:after {
      display: table;
      content: '';
    }
    .slick-track:after {
      clear: both;
    }
    .slick-loading .slick-track {
      visibility: hidden;
    }
    .slick-slide {
      display: none;
      float: left;
      height: 100%;
      min-height: 1px;
    }
    .slick-slide img {
      display: block;
    }
    .slick-initialized .slick-slide {
      display: block;
    }
    .slick-loading .slick-slide {
      visibility: hidden;
    }
    .slick-vertical .slick-slide {
      display: block;
      height: auto;
      border: 1px solid transparent;
    }
    .slick-arrow.slick-hidden {
      display: none;
    }
  `}</style>
);

export const Home = () => {
  const navigate = useNavigate();

  const settings = {
    dots: false,
    infinite: false, // Don't loop for a more natural "app" feel
    speed: 500,
    slidesToShow: 3.2, // Show part of the next one to encourage scroll
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2.2 }
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1.2 }
      }
    ]
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/planner');
  };

  return (
    <div className="min-h-screen pb-20">
      <SlickStyles />
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
           <img 
             src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2000&q=80" 
             alt="Food Background" 
             className="w-full h-full object-cover opacity-50"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
           >
             Taste the Soul of the City
           </motion.h1>
           <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
             Discover hidden gems, plan your perfect food tour, and eat your way through the best local flavors.
           </p>

           <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
             <div className="bg-white p-2 rounded-full shadow-2xl flex items-center">
               <div className="pl-4 text-gray-400">
                 <MapPin className="w-5 h-5" />
               </div>
               <input 
                 type="text" 
                 placeholder="What are you craving? (e.g. Bánh mì, Phở...)"
                 className="flex-1 px-4 py-3 text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
               />
               <button type="submit" className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white px-4 sm:px-8 py-3 rounded-full font-bold transition-colors whitespace-nowrap">
                 Search
               </button>
             </div>
           </form>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-center gap-8">
           {[
             { name: 'Coffee', icon: Coffee, color: 'bg-amber-100 text-amber-600' },
             { name: 'Street Food', icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-600' },
             { name: 'Pizza', icon: Pizza, color: 'bg-red-100 text-red-600' },
             { name: 'Nightlife', icon: Beer, color: 'bg-purple-100 text-purple-600' },
           ].map((cat) => (
             <Link to="/planner" key={cat.name} className="group flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300`}>
                  <cat.icon className="w-8 h-8" />
                </div>
                <span className="font-medium text-slate-600 group-hover:text-slate-900">{cat.name}</span>
             </Link>
           ))}
        </div>
      </section>

      {/* Recommended Section */}
      <section className="container mx-auto px-4 py-8 overflow-hidden">
        <div className="flex justify-between items-end mb-6">
          <div>
             <h2 className="text-2xl font-bold text-slate-800">Recommended for You</h2>
             <p className="text-slate-500 text-sm mt-1">Based on your taste profile</p>
          </div>
          <Link to="/planner" className="text-[#FF6B35] font-medium hover:underline text-sm">View all</Link>
        </div>
        
        <div className="-mx-2">
          <Slider {...settings}>
            {MOCK_RESTAURANTS.map((restaurant) => (
              <div key={restaurant.id} className="px-2 h-full py-2">
                 <Link to={`/restaurant/${restaurant.id}`}>
                   <RestaurantCard restaurant={restaurant} />
                 </Link>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Trending Tours Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
           <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Popular Food Tours</h2>
              <Link to="/planner" className="text-[#FF6B35] font-medium hover:underline text-sm">Create your own</Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_TOURS.map((tour) => (
                <div key={tour.id} className="h-full">
                   <TourCard tour={tour} />
                </div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};