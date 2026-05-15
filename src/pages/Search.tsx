import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapPin, Star, Search, SlidersHorizontal, Clock, Wallet } from "lucide-react";

const API_URL = "http://localhost:5000";

const toMinutes = (hhmm?: string) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
};

// openAt nằm trong openingTime - closingTime (có xử lý qua đêm)
const isTimeInRange = (openAt: string, openingTime?: string, closingTime?: string) => {
    const t = toMinutes(openAt);
    const o = toMinutes(openingTime);
    const c = toMinutes(closingTime);
    if (t == null || o == null || c == null) return true; // thiếu dữ liệu thì cho qua

    // bình thường: 09:00 - 22:00
    if (c > o) return t >= o && t < c;

    // qua đêm: 18:00 - 02:00
    return t >= o || t < c;
};

type Restaurant = {
    _id?: string;
    id: number; // id số (1,2,3..)
    name: string;
    rating: number;
    priceRange?: string;
    address?: string;
    district?: string;
    tags?: string[];
    image?: string;
    openingTime?: string;
    closingTime?: string;
};

type Filters = {
    cuisine?: string;
    location?: string;
    openAt?: string;
    rating?: string;
    distance?: string;
    budget?: string;
};

export const SearchPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // nhận state từ Home navigate('/search', { state: ... })
    const state = (location.state || {}) as { keyword?: string; filters?: Filters };

    const [keyword, setKeyword] = useState(state.keyword || "");
    const [filters, setFilters] = useState<Filters>(state.filters || {});
    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/restaurants`);
                const data: Restaurant[] = await res.json();
                setRestaurants(data || []);
            } catch (e) {
                setRestaurants([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // lọc FE (nhanh + đơn giản). Sau này muốn chuẩn thì làm filter ở BE.
    const filtered = useMemo(() => {
        const kw = keyword.trim().toLowerCase();

        return restaurants.filter((r) => {
            // keyword match
            const hitKeyword =
                !kw ||
                r.name?.toLowerCase().includes(kw) ||
                r.address?.toLowerCase().includes(kw) ||
                r.district?.toLowerCase().includes(kw) ||
                (r.tags || []).join(" ").toLowerCase().includes(kw);

            if (!hitKeyword) return false;

            // location
            if (filters.location) {
                const loc = filters.location.trim(); // "1".."10"
                const ok = String(r.district || "").trim() === loc;
                if (!ok) return false;
            }

            // cuisine (dựa vào tags)
            if (filters.cuisine) {
                const c = filters.cuisine.toLowerCase();
                const ok = (r.tags || []).some((t) => t.toLowerCase().includes(c));
                if (!ok) return false;
            }

            // rating
            if (filters.rating) {
                const min = Number(filters.rating);
                if (!Number.isNaN(min) && (r.rating || 0) < min) return false;
            }
            // budget (theo priceRange: "$".."$$$$$")
            if (filters.budget) {
                const ok = (r.priceRange || "") === filters.budget;
                if (!ok) return false;
            }
            // openAt: giờ chọn phải nằm giữa openingTime - closingTime
            if (filters.openAt) {
                const ok = isTimeInRange(filters.openAt, r.openingTime, r.closingTime);
                if (!ok) return false;
            }


            return true;
        });
    }, [restaurants, keyword, filters]);

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="container mx-auto px-4 py-6">
                {/* Top bar */}
                <div className="flex items-center justify-between gap-3 mb-5">
                    <h1 className="text-2xl font-bold text-slate-800">Search results</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-slate-600 hover:text-slate-900"
                    >
                        ← Back
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                    className="w-full rounded-2xl bg-slate-900/80 p-5 md:p-6 mb-6"
                >
                    {/* FILTER BAR */}
                    <div className="w-full flex flex-wrap justify-center gap-4 md:gap-6 mt-2">

                        {/* Cuisine */}
                        <div className="flex flex-col">
                            <span className="text-white text-base font-semibold uppercase tracking-wide flex items-center gap-1 mb-1">
                                <SlidersHorizontal className="w-4 h-4" />
                                Cuisine
                            </span>
                            <select
                                value={filters.cuisine || ""}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, cuisine: e.target.value }))
                                }
                                className="w-[160px] rounded-xl px-4 py-2.5 text-base font-medium
                   bg-white text-slate-800 border border-white/60
                   focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
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
                            <span className="text-white text-base font-semibold uppercase tracking-wide flex items-center gap-1 mb-1">
                                <MapPin className="w-4 h-4" />
                                Location
                            </span>
                            <select
                                value={filters.location || ""}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, location: e.target.value }))
                                }
                                className="w-[160px] rounded-xl px-4 py-2.5 text-base font-medium
                   bg-white text-slate-800 border border-white/60
                   focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                            >
                                <option value="">Anywhere</option>
                                <option value="1">District 1</option>
                                <option value="2">District 2</option>
                                <option value="3">District 3</option>
                                <option value="4">District 4</option>
                                <option value="5">District 5</option>
                                <option value="6">District 6</option>
                                <option value="7">District 7</option>
                                <option value="8">District 8</option>
                                <option value="9">District 9</option>
                                <option value="10">District 10</option>
                            </select>
                        </div>

                        {/* Opening at */}
                        <div className="flex flex-col">
                            <span className="text-white text-base font-semibold uppercase tracking-wide flex items-center gap-1 mb-1">
                                <Clock className="w-4 h-4" />
                                Opening at
                            </span>
                            <select
                                value={filters.openAt || ""}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, openAt: e.target.value }))
                                }
                                className="w-[160px] rounded-xl px-4 py-2.5 text-base font-medium
                   bg-white text-slate-800 border border-white/60
                   focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                            >
                                <option value="">Any time</option>
                                {Array.from({ length: 24 }).map((_, i) => {
                                    const hour = i.toString().padStart(2, "0");
                                    return (
                                        <option key={i} value={`${hour}:00`}>
                                            {i === 0
                                                ? "12:00 AM"
                                                : i < 12
                                                    ? `${i}:00 AM`
                                                    : i === 12
                                                        ? "12:00 PM"
                                                        : `${i - 12}:00 PM`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Rating */}
                        <div className="flex flex-col">
                            <span className="text-white text-base font-semibold uppercase tracking-wide flex items-center gap-1 mb-1">
                                <Star className="w-4 h-4" />
                                Rating
                            </span>
                            <select
                                value={filters.rating || ""}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, rating: e.target.value }))
                                }
                                className="w-[160px] rounded-xl px-4 py-2.5 text-base font-medium
                   bg-white text-slate-800 border border-white/60
                   focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                            >
                                <option value="">Any</option>
                                <option value="4">4.0+</option>
                                <option value="4.3">4.3+</option>
                                <option value="4.5">4.5+</option>
                                <option value="4.8">4.8+</option>
                            </select>
                        </div>

                        {/* Budget */}
                        <div className="flex flex-col">
                            <span className="text-white text-base font-semibold uppercase tracking-wide flex items-center gap-1 mb-1">
                                <Wallet className="w-4 h-4" />
                                Budget
                            </span>
                            <select
                                value={filters.budget || ""}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, budget: e.target.value }))
                                }
                                className="w-[160px] rounded-xl px-4 py-2.5 text-base font-medium
                   bg-white text-slate-800 border border-white/60
                   focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                            >
                                <option value="">Any</option>
                                <option value="$">$</option>
                                <option value="$$">$$</option>
                                <option value="$$$">$$$</option>
                                <option value="$$$$">$$$$</option>
                                <option value="$$$$$">$$$$$</option>
                            </select>
                        </div>
                    </div>

                    {/* SEARCH INPUT */}
                    <div className="w-full flex justify-center mt-5">
                        <div className="w-full flex flex-wrap md:flex-nowrap gap-4">
                            <div className="flex-1 flex items-center gap-3 border border-white/40 rounded-xl px-4 py-3 bg-white">
                                <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Search for restaurants, dishes, keywords…"
                                    className="flex-1 text-lg md:text-xl font-medium
                     text-slate-800 bg-transparent outline-none
                     placeholder:text-slate-400"
                                />
                            </div>

                            <button
                                type="submit"
                                className="min-w-[200px] flex items-center justify-center gap-2
                   bg-[#FF6B35] hover:bg-[#e55a2b]
                   text-white text-lg md:text-xl font-bold
                   py-3.5 px-6 rounded-xl shadow-md"
                            >
                                <Search className="w-5 h-5" />
                                Search
                            </button>
                        </div>
                    </div>
                </form>







                {/* Search input (cho sửa keyword luôn tại trang này) */}


                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-gray-500">No restaurants found.</p>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((r) => (
                            <Link
                                key={r._id || r.id}
                                to={`/restaurant/${r.id}`}
                                className="block"
                            >
                                <div className="flex gap-4 border border-gray-100 rounded-xl p-3 hover:shadow-sm transition">
                                    {/* image */}
                                    <div className="w-32 h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                        {r.image ? (
                                            <img
                                                src={r.image}
                                                alt={r.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                                No image
                                            </div>
                                        )}
                                    </div>

                                    {/* content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-bold text-xl md:text-2xl text-slate-900 leading-tight truncate">
                                                {r.name}
                                            </h3>
                                            <div className="flex items-center gap-1 text-yellow-500 font-semibold text-sm shrink-0">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span>{(r.rating || 0).toFixed(1)}</span>
                                            </div>
                                        </div>

                                        <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate">
                                                {r.address || r.district || "No address"}
                                            </span>
                                        </div>

                                        <div className="text-sm text-slate-600 mt-2">
                                            {r.priceRange ? `${r.priceRange}` : ""}
                                            {r.tags?.length ? ` • ${r.tags.join(", ")}` : ""}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
