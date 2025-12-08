import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Soup, Coffee, UtensilsCrossed, Beer, Clock, Star, Navigation, SlidersHorizontal, Fish, Flame, Wallet, } from 'lucide-react';
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

  // state ô search + filter
  const [keyword, setKeyword] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [openAt, setOpenAt] = useState('');
  const [rating, setRating] = useState('');
  const [distance, setDistance] = useState('');
  const [budget, setBudget] = useState('');

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3.2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2.2 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1.2 },
      },
    ],
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    navigate('/planner', {
      state: {
        keyword,
        filters: {
          cuisine,
          location: locationFilter,
          openAt,
          rating,
          distance,
          budget,
        },
      },
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <SlickStyles />

      {/* Hero Section */}
      <section className="relative h-[520px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2000&q=80"
            alt="Food Background"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
            >
              Taste the Soul of the City
            </motion.h1>
            <p className="text-lg text-gray-200 mb-4 max-w-2xl mx-auto">
              Discover hidden gems, plan your perfect food tour, and eat your way through the best local flavors.
            </p>
          </div>

          {/* Search + Filters card */}
          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-4 md:p-6 space-y-4"
          >
            {/* FILTER BAR  */}
            <div className="w-full flex flex-wrap justify-center gap-2 md:gap-4 mt-3">

              {/* Cuisine */}
              <div className="flex flex-col">
                <span className="text-white/90 text-[11px] uppercase tracking-wide drop-shadow flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" /> Cuisine
                </span>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-[140px] border border-white/60 rounded-lg px-2 py-1.5 text-xs bg-white/90 text-slate-800 
        focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                >
                  <option value="">Any</option>
                  <option value="Vietnamese">Vietnamese</option>
                  <option value="Street Food">Street Food</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Seafood">Seafood</option>
                  <option value="Hotpot & BBQ">Hotpot & BBQ</option>
                </select>
              </div>

              {/* Location */}
              <div className="flex flex-col">
                <span className="text-white/90 text-[11px] uppercase tracking-wide drop-shadow flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </span>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-[140px] border border-white/60 rounded-lg px-2 py-1.5 text-xs bg-white/90 text-slate-800 
        focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                >
                  <option value="">Anywhere</option>
                  <option value="District 1">District 1</option>
                  <option value="District 2">District 2</option>
                  <option value="District 3">District 3</option>
                  <option value="District 4">District 4</option>
                  <option value="District 5">District 5</option>
                  <option value="District 6">District 6</option>
                  <option value="District 7">District 7</option>
                  <option value="District 8">District 8</option>
                  <option value="District 9">District 9</option>
                  <option value="District 10">District 10</option>
                </select>
              </div>

              {/* Opening at */}
              <div className="flex flex-col">
                <span className="text-white/90 text-[11px] uppercase tracking-wide drop-shadow flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Opening at
                </span>
                <select
                  value={openAt}
                  onChange={(e) => setOpenAt(e.target.value)}
                  className="w-[140px] border border-white/60 rounded-lg px-2 py-1.5 text-xs bg-white/90 text-slate-800 
        focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                >
                  <option value="">Any time</option>
                  {/* AM */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <option key={i} value={`${hour}:00`}>
                        {i === 0 ? '12:00 AM' : `${i}:00 AM`}
                      </option>
                    );
                  })}
                  {/* PM */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const hour24 = (i + 12).toString().padStart(2, '0');
                    return (
                      <option key={i + 20} value={`${hour24}:00`}>
                        {i === 0 ? '12:00 PM' : `${i}:00 PM`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Rating */}
              <div className="flex flex-col">
                <span className="text-white/90 text-[11px] uppercase tracking-wide drop-shadow flex items-center gap-1">
                  <Star className="w-3 h-3" /> Rating
                </span>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-[140px] border border-white/60 rounded-lg px-2 py-1.5 text-xs bg-white/90 text-slate-800 
        focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                >
                  <option value="">Any</option>
                  <option value="4">4.0+</option>
                  <option value="4.3">4.3+</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.8">4.8+</option>
                </select>
              </div>

              {/* Distance */}
              <div className="flex flex-col">
                <span className="text-white/90 text-[11px] uppercase tracking-wide drop-shadow flex items-center gap-1">
                  <Navigation className="w-3 h-3" /> Distance
                </span>
                <select
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-[140px] border border-white/60 rounded-lg px-2 py-1.5 text-xs bg-white/90 text-slate-800 
        focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                >
                  <option value="">Any</option>
                  <option value="1">≤ 1 km</option>
                  <option value="3">≤ 3 km</option>
                  <option value="5">≤ 5 km</option>
                  <option value="10">≤ 10 km</option>
                  <option value="20">≤ 20 km</option>
                </select>
              </div>

              {/* Budget */}
              <div className="flex flex-col">
                <span className="text-white/90 text-[11px] uppercase tracking-wide drop-shadow flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Budget
                </span>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-[140px] border border-white/60 rounded-lg px-2 py-1.5 text-xs bg-white/90 text-slate-800 
        focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                >
                  <option value="">Any</option>
                  <option value="0-50000">{'< 50,000đ'}</option>
                  <option value="50000-100000">50,000 - 100,000đ</option>
                  <option value="100000-300000">100,000 - 300,000đ</option>
                  <option value="300000-500000">300,000 - 500,000đ</option>
                  <option value="gt-500000">{'> 500,000đ'}</option>
                </select>
              </div>
            </div>

            {/* DÒNG SEARCH CHÍNH */}
            <div className="w-full flex justify-center mt-1">
              <div className="w-full flex flex-wrap md:flex-nowrap gap-2 md:gap-4 justify-start mt-3">
                <div className="flex-1 flex items-center gap-3 border border-white/40 rounded-xl px-3 py-2 bg-white/90">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search for restaurants, dishes, keywords…"
                    className="flex-1 px-1 py-2 text-slate-800 bg-transparent outline-none placeholder:text-slate-400 text-sm md:text-base"
                  />
                </div>

                {/* nút search */}
                <button
                  type="submit"
                  className="flex-[1] min-w-[180px] flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#e55a2b] text-white py-3.5 px-6 
                 rounded-xl font-semibold text-sm md:text-base transition-colors whitespace-nowrap shadow-md"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>

          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-center gap-8">
          {[
            {
              name: "Vietnamese",
              icon: Soup,
              color: "bg-emerald-100 text-emerald-600",
            },
            {
              name: "Street Food",
              icon: UtensilsCrossed,
              color: "bg-orange-100 text-orange-600",
            },
            {
              name: "Drinks",
              icon: Beer,
              color: "bg-blue-100 text-blue-600",
            },
            {
              name: "Seafood",
              icon: Fish,
              color: "bg-cyan-100 text-cyan-600",
            },
            {
              name: "Hotpot & BBQ",
              icon: Flame,
              color: "bg-red-100 text-red-600",
            },
          ].map((cat) => (
            <Link
              to="/planner"
              key={cat.name}
              className="group flex flex-col items-center gap-3"
            >
              <div
                className={`w-16 h-16 rounded-2xl ${cat.color} 
          flex items-center justify-center shadow-sm 
          group-hover:shadow-md group-hover:scale-110 
          transition-all duration-300`}
              >
                <cat.icon className="w-8 h-8" />
              </div>

              <span className="font-medium text-slate-700 group-hover:text-slate-900">
                {cat.name}
              </span>
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
          <Link to="/planner" className="text-[#FF6B35] font-medium hover:underline text-sm">
            View all
          </Link>
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
            <Link to="/planner" className="text-[#FF6B35] font-medium hover:underline text-sm">
              Create your own
            </Link>
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
