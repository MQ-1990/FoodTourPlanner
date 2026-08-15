"use client";

import { useState, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Navigation,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  Soup,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  type Restaurant,
  MOCK_TOURS,
} from "../lib/data";
import { useRestaurants } from "../context/RestaurantContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import api from "../lib/api";
import {
  DraggableStop,
  SearchMenu,
  CollapsedSidebar,
  TourSearchPanel,
  DishSearchPanel,
  RestaurantSearchPanel,
  MapPanel,
  SavedPanel,
  TourMenuPanel,
  MyToursPanel,
  TourDetailPanel,
  DishDetailPanel,
  RestaurantDetailPanel,
  MiniItineraryPanel,
  ItineraryPanel,
} from "../components/planner";

export const Planner = () => {
  const location = useLocation();
  const { restaurants: allRestaurants, isLoading: isLoadingRestaurants } = useRestaurants();
  const { user } = useAuth();

  // Tour state
  const [tourStops, setTourStops] = useState<Restaurant[]>([]);
  const tourStopsRef = useRef<Restaurant[]>([]);
  const [tourName, setTourName] = useState("My Food Tour");
  const [tourDescription, setTourDescription] = useState("");
  const [tourTags, setTourTags] = useState<string[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingTourId, setEditingTourId] = useState<
    string | null
  >(null);
  const [tempName, setTempName] = useState(tourName);
  const [showItinerary, setShowItinerary] = useState(false);
  const [showMiniItinerary, setShowMiniItinerary] =
    useState(false);
  const [hasLoadedItineraryDraft, setHasLoadedItineraryDraft] = useState(false);

  useEffect(() => {
    tourStopsRef.current = tourStops;
  }, [tourStops]);

  // Tour Menu state
  const [showTourMenu, setShowTourMenu] = useState(false);

  const availableTags = [
    "Foodie",
    "Nightlife",
    "Cultural",
    "Family Friendly",
    "Budget",
    "Luxury",
    "Adventure",
    "Coffee",
  ];

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDistrict, setSelectedDistrict] =
    useState<string>("");
  const [selectedPrice, setSelectedPrice] =
    useState<string>("");
  const [selectedCuisine, setSelectedCuisine] =
    useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyOpen, setOnlyOpen] = useState(false);

  // Navigation Panel States
  const [showSearchMenu, setShowSearchMenu] = useState(true); // Default to search menu on load
  const [showRestaurantSearch, setShowRestaurantSearch] =
    useState(false); // Explicit state for restaurant search
  const [showTourSearch, setShowTourSearch] = useState(false);

  // NEW: Dish Search States
  const [showDishSearch, setShowDishSearch] = useState(false);
  const [selectedDish, setSelectedDish] = useState<any | null>(
    null,
  );
  const [dishSearchQuery, setDishSearchQuery] = useState("");
  const [showDishFilters, setShowDishFilters] = useState(false);

  // NEW: Dish Filter States
  const [dishCuisine, setDishCuisine] = useState("");
  const [dishPreference, setDishPreference] = useState("");
  const [dishBudget, setDishBudget] = useState("");
  const [dishLocation, setDishLocation] = useState("");
  const [dishOpenAt, setDishOpenAt] = useState("");
  const [dishDistance, setDishDistance] = useState("");

  // Filter Options Arrays
  const dishCuisines = [
    "Vietnamese",
    "Street Food",
    "Drinks",
    "Seafood",
    "Hotpot & BBQ",
  ];
  const dishPreferences = [
    "Món cay",
    "Món ngọt",
    "Hải sản",
    "Cà phê",
    "Trà sữa",
    "Chay",
    "Đồ nướng",
    "Phở",
    "Bún",
  ];
  const dishBudgets = [
    "< 50,000đ",
    "50,000 - 100,000đ",
    "100,000 - 300,000đ",
    "300,000 - 500,000đ",
    "> 500,000đ",
  ];
  const dishDistances = ["1", "3", "5", "10", "20"]; // km

  const [tourSearchQuery, setTourSearchQuery] = useState("");
  const [showTourFilters, setShowTourFilters] = useState(false);
  const [tourMinRating, setTourMinRating] = useState<number>(0);
  const [tourDurationFilter, setTourDurationFilter] =
    useState<string>("");
  const [tourStopsFilter, setTourStopsFilter] =
    useState<string>("");

  // Panel & Detail state
  const [isPanelCollapsed, setIsPanelCollapsed] =
    useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(
      location.state?.selectedRestaurant || null,
    );
  const [previousRestaurant, setPreviousRestaurant] =
    useState<Restaurant | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [selectedTour, setSelectedTour] = useState<any | null>(
    null,
  );
  const [previousTour, setPreviousTour] = useState<any | null>(
    null,
  );

  // Favorites from backend profile
  const [favoriteRestaurants, setFavoriteRestaurants] =
    useState<Restaurant[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  // Initialize saved tours with all MOCK_TOURS (same as Profile page)
  const [savedTours, setSavedTours] =
    useState<any[]>(MOCK_TOURS);

  const fetchFavoriteRestaurants = async () => {
    try {
      const res = await api.get("/users/me");
      const ids = Array.isArray(res.data?.favorites) ? res.data.favorites : [];
      setFavoriteIds(ids);
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
      setFavoriteIds([]);
    }
  };

  // Sync favorites when profile/restaurants load from API
  useEffect(() => {
    fetchFavoriteRestaurants();
  }, []);

  useEffect(() => {
    setFavoriteRestaurants(
      allRestaurants.filter((restaurant) => favoriteIds.includes(Number(restaurant.id))),
    );
  }, [allRestaurants, favoriteIds]);

  // Track which saved category is being viewed: null | 'favorites' | 'tours'
  const [savedCategory, setSavedCategory] = useState<
    "favorites" | "tours" | null
  >(null);

  // My Tours state
  const [showMyTours, setShowMyTours] = useState(false);
  const [myTours, setMyTours] = useState<any[]>([]);

  const normalizeBackendRestaurant = (restaurant: any): Restaurant | null => {
    if (!restaurant) return null;
    const matched = allRestaurants.find(
      (item) =>
        String(item._id) === String(restaurant._id) ||
        String(item.id) === String(restaurant.id),
    );

    if (matched) return matched;

    return {
      ...restaurant,
      id: String(restaurant.id ?? restaurant._id),
      reviewCount: restaurant.reviewCount ?? 0,
      priceRange: restaurant.priceRange ?? "$$",
      image:
        restaurant.image ||
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      tags: restaurant.tags ?? [],
      description: restaurant.description ?? "",
      dishes: restaurant.dishes ?? [],
      reviews: restaurant.reviews ?? [],
      amenities: restaurant.amenities ?? [],
      lat: restaurant.lat ?? 0,
      lng: restaurant.lng ?? 0,
    };
  };

  const normalizeBackendTour = (tour: any) => {
    const stops = Array.isArray(tour.restaurants)
      ? tour.restaurants
        .slice()
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((item: any) => normalizeBackendRestaurant(item.restaurant))
        .filter(Boolean)
      : [];

    return {
      ...tour,
      id: String(tour._id ?? tour.id),
      title: tour.name,
      stops,
      tags: tour.tags || [],
      image: stops[0]?.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=60",
      duration: `${stops.length * 1.5} hours`,
      distance: tour.totalDistance ? `${tour.totalDistance.toFixed(1)} km` : "N/A",
      rating: tour.rating || 0,
      isBackendTour: true,
    };
  };

  const getRestaurantObjectId = (restaurant: Restaurant) => {
    if (restaurant._id) return restaurant._id;
    return allRestaurants.find((item) => String(item.id) === String(restaurant.id))?._id;
  };

  const fetchMyTours = async () => {
    try {
      const res = await api.get("/tours");
      setMyTours((res.data || []).map(normalizeBackendTour));
    } catch (err) {
      console.error("Failed to fetch tours:", err);
      const storedTours = JSON.parse(
        localStorage.getItem("savedTours") || "[]",
      );
      setMyTours(storedTours);
      toast.error("Could not load tours from server. Showing local tours.");
    }
  };

  const fetchPublicTours = async () => {
    try {
      const res = await api.get("/tours/public");
      setSavedTours((res.data || []).map(normalizeBackendTour));
    } catch (err) {
      console.error("Failed to fetch public tours:", err);
      setSavedTours(MOCK_TOURS);
    }
  };

  // Load my tours from backend, with local fallback
  useEffect(() => {
    if (!isLoadingRestaurants) {
      fetchMyTours();
      fetchPublicTours();
    }
  }, [isLoadingRestaurants, allRestaurants.length]);

  const itineraryDraftKey = `currentItineraryDraft:${user?.id || "guest"}`;

  useEffect(() => {
    if (isLoadingRestaurants || hasLoadedItineraryDraft) return;

    const rawDraft = localStorage.getItem(itineraryDraftKey);
    if (!rawDraft) {
      setHasLoadedItineraryDraft(true);
      return;
    }

    try {
      const draft = JSON.parse(rawDraft);
      const stopIds: string[] = Array.isArray(draft.stopIds) ? draft.stopIds.map(String) : [];
      const restoredStops = stopIds
        .map((id) => allRestaurants.find((restaurant) => String(restaurant.id) === id))
        .filter(Boolean) as Restaurant[];

      if (restoredStops.length > 0) {
        setTourStops(restoredStops);
        setTourName(draft.name || "My Food Tour");
        setTempName(draft.name || "My Food Tour");
        setTourDescription(draft.description || "");
        setTourTags(Array.isArray(draft.tags) ? draft.tags : []);
      }
    } catch (err) {
      console.error("Failed to restore itinerary draft:", err);
      localStorage.removeItem(itineraryDraftKey);
    } finally {
      setHasLoadedItineraryDraft(true);
    }
  }, [allRestaurants, hasLoadedItineraryDraft, isLoadingRestaurants, itineraryDraftKey]);

  useEffect(() => {
    if (!hasLoadedItineraryDraft) return;

    if (tourStops.length === 0 && tourName === "My Food Tour" && !tourDescription && tourTags.length === 0) {
      localStorage.removeItem(itineraryDraftKey);
      return;
    }

    localStorage.setItem(
      itineraryDraftKey,
      JSON.stringify({
        name: tourName,
        description: tourDescription,
        tags: tourTags,
        stopIds: tourStops.map((stop) => String(stop.id)),
        updatedAt: new Date().toISOString(),
      }),
    );
  }, [hasLoadedItineraryDraft, itineraryDraftKey, tourDescription, tourName, tourStops, tourTags]);

  // Track previous view for back navigation
  const [previousView, setPreviousView] = useState<
    | "search-menu"
    | "restaurant-search"
    | "tour-search"
    | "dish-search"
    | "favorites"
    | "tours"
    | "saved-menu"
    | "tour-detail"
    | "my-tours"
    | "current-itinerary"
    | "tour-menu"
  >("search-menu");

  const districts = [
    "District 1",
    "District 2",
    "District 3",
    "District 4",
  ];
  const priceRanges = ["$", "$$", "$$$", "$$$$"];
  const cuisines = [
    "Vietnamese",
    "Phở",
    "Bánh Mì",
    "Coffee",
    "Seafood",
    "Fusion",
  ];

  // Remove from favorites
  const removeFavorite = async (id: string) => {
    try {
      await api.delete(`/users/me/favorites/${id}`);
      setFavoriteIds((prev) => prev.filter((favoriteId) => favoriteId !== Number(id)));
      toast.success("Removed from favorites");
    } catch (err: any) {
      console.error("Failed to remove favorite:", err);
      toast.error(err?.response?.data?.message || "Could not remove favorite");
    }
  };

  // Remove from saved tours
  const removeSavedTour = (id: string) => {
    setSavedTours((prev) => prev.filter((t) => t.id !== id));
    toast.success("Tour removed");
  };

  // Load a saved tour into the planner
  const loadTour = (tour: any) => {
    // Map tour ID to restaurants
    let tourRestaurants: Restaurant[] = [];

    if (tour.stops && Array.isArray(tour.stops)) {
      tourRestaurants = tour.stops;
    } else if (tour.id === "t1") {
      // Street Food Adventure - first 5 restaurants
      tourRestaurants = allRestaurants.slice(0, 5);
    } else if (tour.id === "t2") {
      // Hidden Coffee Gems - 3 coffee-related restaurants
      tourRestaurants = allRestaurants.filter(
        (r) =>
          r.tags.includes("Coffee") ||
          r.tags.includes("Drinks") ||
          r.name.toLowerCase().includes("coffee"),
      ).slice(0, 3);
    } else if (tour.id === "t3") {
      // Vegetarian Delights - 4 different restaurants
      tourRestaurants = allRestaurants.slice(2, 6);
    }

    setTourStops(tourRestaurants);
    setTourName(tour.title || tour.name || "Untitled Tour");
    setTourDescription(tour.description || "");
    setTourTags(tour.tags || []);
    setShowItinerary(true);
    setShowMiniItinerary(false);
    setShowSaved(false);
    setShowTourMenu(false);
    setSavedCategory(null);
    setSelectedRestaurant(null);
    setSelectedTour(null);
    setEditingTourId(null); // Default to new tour unless specified otherwise

    toast.success(`Loaded "${tour.title || tour.name}"!`);
  };

  // Get tour restaurants for display
  const getTourRestaurants = (tour: any): Restaurant[] => {
    if (tour.stops && Array.isArray(tour.stops)) {
      return tour.stops;
    }
    if (tour.id === "t1") {
      return allRestaurants.slice(0, 5);
    } else if (tour.id === "t2") {
      return allRestaurants.filter(
        (r) =>
          r.tags.includes("Coffee") ||
          r.tags.includes("Drinks") ||
          r.name.toLowerCase().includes("coffee"),
      ).slice(0, 3);
    } else if (tour.id === "t3") {
      return allRestaurants.slice(2, 6);
    }
    return [];
  };

  // Handle tour from navigation state (when coming from TourDetail page)
  useEffect(() => {
    if (location.state?.tour) {
      const tourFromState = location.state.tour;
      // Find matching tour in MOCK_TOURS
      const matchingTour = MOCK_TOURS.find(
        (t) => t.id === tourFromState.id,
      );
      if (matchingTour) {
        setSelectedTour(matchingTour);
        setShowSaved(false);
        setShowTourMenu(false);
        setSavedCategory(null);
        setSelectedRestaurant(null);
        setShowItinerary(false);
        setPreviousView("search-menu"); // Set default
        toast.success(`Viewing "${matchingTour.title}"!`);
      }
      // Clear the state to prevent re-triggering on future navigations
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Filter restaurants
  const getBudgetRange = (budgetStr: string) => {
    if (!budgetStr) return { min: 0, max: Infinity };
    if (budgetStr.includes("<")) return { min: 0, max: 50000 };
    if (budgetStr.includes(">"))
      return { min: 500000, max: Infinity };

    // Handle ranges like "50,000 - 100,000đ"
    const parts = budgetStr.replace(/[^\d-]/g, "").split("-"); // Remove non-digits/hyphens
    if (parts.length === 2) {
      return {
        min: parseInt(parts[0]),
        max: parseInt(parts[1]),
      };
    }
    return { min: 0, max: Infinity };
  };

  // --- 1. FILTER RESTAURANTS LOGIC ---
  const filteredRestaurants = allRestaurants.filter((r) => {
    // District
    if (
      selectedDistrict &&
      !r.address.includes(selectedDistrict)
    )
      return false;
    // Price ($ signs)
    if (selectedPrice && r.priceRange !== selectedPrice)
      return false;
    // Cuisine (Tags)
    if (selectedCuisine && !r.tags.includes(selectedCuisine))
      return false;
    // Rating
    if (minRating && r.rating < minRating) return false;
    // Open Now
    if (onlyOpen && !r.openNow) return false;
    // Search Query
    if (
      searchQuery &&
      !r.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !r.address
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
      return false;

    return true;
  });

  // --- 2. FILTER TOURS LOGIC ---
  const getAllTours = () => {
    const allTours = [...savedTours];
    // Add user's created tours that aren't already in public/saved tours
    myTours.forEach((tour) => {
      if (!allTours.find((t) => t.id === tour.id)) {
        allTours.push({
          ...tour,
          title: tour.title || tour.name,
          stops: Array.isArray(tour.stops)
            ? tour.stops.length
            : tour.stops,
          duration:
            tour.duration ||
            `${(Array.isArray(tour.stops) ? tour.stops.length : 0) * 1.5} hours`,
          distance: tour.distance || "N/A",
          rating: tour.rating || 0,
          image:
            tour.image ||
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=60",
        });
      }
    });
    return allTours;
  };

  const filteredTours = getAllTours().filter((tour) => {
    const tourTitle = tour.title || tour.name || "";

    // Search Query
    if (
      tourSearchQuery &&
      !tourTitle
        .toLowerCase()
        .includes(tourSearchQuery.toLowerCase())
    )
      return false;

    // Rating
    if (tourMinRating > 0 && (tour.rating || 0) < tourMinRating)
      return false;

    // Duration filter logic
    if (tourDurationFilter) {
      const durationStr = tour.duration || "";
      const hours = parseFloat(durationStr) || 0;
      if (tourDurationFilter === "short" && hours > 2)
        return false;
      if (
        tourDurationFilter === "medium" &&
        (hours <= 2 || hours > 3)
      )
        return false;
      if (tourDurationFilter === "long" && hours <= 3)
        return false;
    }

    // Stops filter logic
    if (tourStopsFilter) {
      const stops =
        typeof tour.stops === "number"
          ? tour.stops
          : Array.isArray(tour.stops)
            ? tour.stops.length
            : 0;
      if (tourStopsFilter === "few" && stops > 3) return false;
      if (
        tourStopsFilter === "moderate" &&
        (stops <= 3 || stops > 5)
      )
        return false;
      if (tourStopsFilter === "many" && stops <= 5)
        return false;
    }

    return true;
  });

  const clearTourFilters = () => {
    setTourMinRating(0);
    setTourDurationFilter("");
    setTourStopsFilter("");
  };

  // --- 3. FILTER DISHES LOGIC ---
  const getAggregatedDishes = () => {
    const allDishes: Record<string, any> = {};

    // Parse budget once
    const { min: budgetMin, max: budgetMax } =
      getBudgetRange(dishBudget);

    allRestaurants.forEach((repo) => {
      // -- Filter Parent Restaurant First --
      // (Keeps checking Restaurant tags for the "Available at" search logic)
      if (dishLocation && !repo.address.includes(dishLocation))
        return;
      if (dishCuisine && !repo.tags.includes(dishCuisine))
        return;
      if (
        dishPreference &&
        !repo.tags.includes(dishPreference) &&
        !repo.amenities.includes(dishPreference)
      )
        return;

      repo.dishes.forEach((dish) => {
        // -- Filter Dish --
        if (
          dishSearchQuery &&
          !dish.name
            .toLowerCase()
            .includes(dishSearchQuery.toLowerCase())
        )
          return;

        const rawPrice =
          parseInt(dish.price.replace(/,/g, ""), 10) || 0;
        const priceVND = rawPrice;

        if (dishBudget) {
          if (priceVND < budgetMin || priceVND > budgetMax)
            return;
        }

        // -- Aggregation --
        const key = dish.name.trim();

        if (!allDishes[key]) {
          allDishes[key] = {
            name: key,
            image: dish.image,
            description: "A popular choice among locals.",
            minPrice: rawPrice,
            maxPrice: rawPrice,
            restaurants: [],
            tags: new Set(), // Initialize Set
          };
        } else {
          if (rawPrice < allDishes[key].minPrice)
            allDishes[key].minPrice = rawPrice;
          if (rawPrice > allDishes[key].maxPrice)
            allDishes[key].maxPrice = rawPrice;
        }

        // --- NEW: Add ONLY specific dish tags ---
        if (dish.tags) {
          dish.tags.forEach((tag) =>
            allDishes[key].tags.add(tag),
          );
        }

        // Add restaurant
        if (
          !allDishes[key].restaurants.find(
            (r: any) => r.id === repo.id,
          )
        ) {
          allDishes[key].restaurants.push(repo);
        }
      });
    });

    // Convert Set to Array for rendering
    return Object.values(allDishes).map((d) => ({
      ...d,
      tags: Array.from(d.tags),
    }));
  };

  const filteredDishes = getAggregatedDishes();

  const clearDishFilters = () => {
    setDishCuisine("");
    setDishPreference("");
    setDishBudget("");
    setDishLocation("");
    setDishOpenAt("");
    setDishDistance("");
  };

  // Tour management functions
  const syncUpdatedTour = (backendTour: any) => {
    const updatedTour = normalizeBackendTour(backendTour);
    setMyTours((prev) => prev.map((tour) => tour.id === updatedTour.id ? updatedTour : tour));
    setSavedTours((prev) => prev.map((tour) => tour.id === updatedTour.id ? updatedTour : tour));
    return updatedTour;
  };

  const moveStop = (dragIndex: number, hoverIndex: number) => {
    const dragStop = tourStops[dragIndex];
    const newStops = [...tourStops];
    newStops.splice(dragIndex, 1);
    newStops.splice(hoverIndex, 0, dragStop);
    tourStopsRef.current = newStops;
    setTourStops(newStops);
  };

  const syncStopOrder = async () => {
    if (!editingTourId) return;

    const stopsToSync = tourStopsRef.current;
    const restaurantIds = stopsToSync.map(getRestaurantObjectId).filter(Boolean);
    if (restaurantIds.length !== stopsToSync.length) {
      toast.error("Could not sync order: missing restaurant ids");
      return;
    }

    try {
      const res = await api.patch(`/tours/${editingTourId}/reorder`, {
        restaurantIds,
      });
      const updatedTour = syncUpdatedTour(res.data.tour);
      setTourStops(updatedTour.stops);
    } catch (err: any) {
      console.error("Failed to reorder tour:", err);
      toast.error(err?.response?.data?.message || "Could not sync new order");
    }
  };

  const removeStop = async (id: string) => {
    const removedStop = tourStops.find((stop) => String(stop.id) === String(id));
    const newStops = tourStops.filter((stop) => String(stop.id) !== String(id));
    setTourStops(newStops);

    if (!editingTourId || !removedStop) return;

    const restaurantId = getRestaurantObjectId(removedStop);
    if (!restaurantId) {
      toast.error("Could not remove stop: missing restaurant id");
      return;
    }

    try {
      const res = await api.delete(`/tours/${editingTourId}/restaurants/${restaurantId}`);
      const updatedTour = syncUpdatedTour(res.data.tour);
      setTourStops(updatedTour.stops);
    } catch (err: any) {
      console.error("Failed to remove stop:", err);
      setTourStops(tourStops);
      toast.error(err?.response?.data?.message || "Could not remove stop");
    }
  };

  const toggleRestaurantSelection = (
    restaurant: Restaurant,
  ) => {
    const isSelected = tourStops.find(
      (s) => s.id === restaurant.id,
    );
    if (isSelected) {
      removeStop(restaurant.id);
    } else {
      setTourStops([...tourStops, restaurant]);
      if (!showItinerary && tourStops.length === 0) {
        toast.success(
          "Restaurant added to tour! Open itinerary to view.",
        );
      }
    }
  };

  const optimizeRoute = async () => {
    if (editingTourId) {
      try {
        const res = await api.post(`/tours/${editingTourId}/optimize`);
        const updatedTour = syncUpdatedTour(res.data.tour);
        setTourStops(updatedTour.stops);
        toast.success("Route optimized!");
      } catch (err: any) {
        console.error("Failed to optimize tour:", err);
        toast.error(err?.response?.data?.message || "Could not optimize route");
      }
      return;
    }

    const sorted = [...tourStops].sort((a, b) => a.lat - b.lat);
    setTourStops(sorted);
    toast.success("Route optimized!");
  };

  const handleSaveTour = async () => {
    const restaurantIds = tourStops
      .map(getRestaurantObjectId)
      .filter(Boolean);

    if (restaurantIds.length !== tourStops.length) {
      toast.error("Some restaurants are missing backend ids. Please refresh and try again.");
      return;
    }

    const tour = {
      id: editingTourId || Date.now().toString(),
      name: tourName,
      description: tourDescription,
      tags: tourTags,
      stops: tourStops,
      createdAt: editingTourId
        ? myTours.find((t) => t.id === editingTourId)
          ?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    try {
      const payload = {
        name: tourName,
        description: tourDescription,
        restaurantIds,
      };

      const res = editingTourId
        ? await api.put(`/tours/${editingTourId}`, payload)
        : await api.post("/tours", payload);
      const savedTour = normalizeBackendTour(res.data.tour);

      if (editingTourId) {
        setMyTours((prev) => prev.map((item) => item.id === editingTourId ? savedTour : item));
        setSavedTours((prev) => prev.map((item) => item.id === editingTourId ? savedTour : item));
        toast.success(`"${tourName}" updated successfully!`);
      } else {
        setMyTours((prev) => [savedTour, ...prev]);
        setSavedTours((prev) => prev.find((item) => item.id === savedTour.id) ? prev : [...prev, savedTour]);
        toast.success(`"${tourName}" saved successfully!`);
      }

      setTourStops([]);
      setTourName("My Food Tour");
      setTourDescription("");
      setTourTags([]);
      setEditingTourId(null);
      localStorage.removeItem(itineraryDraftKey);
      return;
    } catch (err: any) {
      console.error("Failed to save tour to backend:", err);
      toast.error(err?.response?.data?.message || "Could not save tour to server. Saved locally instead.");
    }

    let newSavedTours;
    if (editingTourId) {
      // Update existing tour in My Tours
      newSavedTours = myTours.map((t) =>
        t.id === editingTourId ? tour : t,
      );

      // Update in Saved Tours if present there too
      if (savedTours.find((t) => t.id === editingTourId)) {
        setSavedTours(
          savedTours.map((t) =>
            t.id === editingTourId ? tour : t,
          ),
        );
      }

      toast.success(`"${tourName}" updated successfully!`);
    } else {
      // Create new tour
      newSavedTours = [...myTours, tour];

      // Also add to savedTours (Bookmarks) as requested
      if (!savedTours.find((t) => t.id === tour.id)) {
        setSavedTours([...savedTours, tour]);
      }

      toast.success(`"${tourName}" saved successfully!`);
    }

    setMyTours(newSavedTours);
    localStorage.setItem(
      "savedTours",
      JSON.stringify(newSavedTours),
    );

    // Clear current itinerary
    setTourStops([]);
    setTourName("My Food Tour");
    setTourDescription("");
    setTourTags([]);
    setEditingTourId(null);
  };

  const handleDeleteMyTour = async (id: string) => {
    try {
      await api.delete(`/tours/${id}`);
      setMyTours((prev) => prev.filter((t) => t.id !== id));
      setSavedTours((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tour deleted");
    } catch (err: any) {
      console.error("Failed to delete tour from backend:", err);
      const newTours = myTours.filter((t) => t.id !== id);
      setMyTours(newTours);
      localStorage.setItem(
        "savedTours",
        JSON.stringify(newTours),
      );
      toast.error(err?.response?.data?.message || "Could not delete tour from server. Removed locally.");
    }
  };

  const handleToggleTourPrivacy = async (tour: any) => {
    try {
      const nextIsPublic = !tour.isPublic;
      const res = await api.patch(`/tours/${tour.id}/privacy`, {
        isPublic: nextIsPublic,
      });
      const updatedTour = normalizeBackendTour(res.data.tour);

      setMyTours((prev) => prev.map((item) => item.id === tour.id ? updatedTour : item));
      setSelectedTour(updatedTour);
      setSavedTours((prev) => {
        const withoutTour = prev.filter((item) => item.id !== tour.id);
        return nextIsPublic ? [updatedTour, ...withoutTour] : withoutTour;
      });

      toast.success(`Tour is now ${nextIsPublic ? "public" : "private"}`);
    } catch (err: any) {
      console.error("Failed to update tour privacy:", err);
      toast.error(err?.response?.data?.message || "Could not update tour privacy");
    }
  };

  const handleEditMyTour = (tour: any) => {
    loadTour(tour);
    setEditingTourId(tour.id);
    setShowMyTours(false);
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      setTourName(tempName);
      setIsEditingName(false);
    }
  };

  const handleNameCancel = () => {
    setTempName(tourName || "Untitled Tour");
    setIsEditingName(false);
  };

  const clearFilters = () => {
    setSelectedDistrict("");
    setSelectedPrice("");
    setSelectedCuisine("");
    setMinRating(0);
    setOnlyOpen(false);
  };

  const handleMapDotClick = (restaurant: Restaurant) => {
    // Track previous view
    if (showItinerary) {
      setPreviousView("current-itinerary");
    } else if (selectedTour) {
      setPreviousView("tour-detail");
      setPreviousTour(selectedTour);
    } else if (showMyTours) {
      setPreviousView("my-tours");
    } else if (showTourMenu) {
      setPreviousView("tour-menu");
    } else if (showTourSearch) {
      setPreviousView("tour-search");
    } else if (showRestaurantSearch) {
      setPreviousView("restaurant-search");
    } else if (showSearchMenu) {
      setPreviousView("search-menu");
    } else if (showSaved && savedCategory === "favorites") {
      setPreviousView("favorites");
    } else if (showSaved && savedCategory === "tours") {
      setPreviousView("tours");
    } else if (showSaved) {
      setPreviousView("saved-menu");
    } else {
      setPreviousView("search-menu");
    }

    // Force all overlapping views to close
    setShowItinerary(false);
    setShowMiniItinerary(false);
    setShowSaved(false);
    setShowTourMenu(false);
    setShowMyTours(false);
    setShowSearchMenu(false);
    setShowTourSearch(false);
    setShowRestaurantSearch(false);
    setSelectedTour(null);

    // Set the restaurant
    setSelectedRestaurant(restaurant);

    if (isPanelCollapsed) {
      setIsPanelCollapsed(false);
    }
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    // Track previous view
    if (showItinerary) {
      setPreviousView("current-itinerary");
    } else if (selectedTour) {
      setPreviousView("tour-detail");
      setPreviousTour(selectedTour); // Save the current tour
    } else if (showSaved && savedCategory === "favorites") {
      setPreviousView("favorites");
    } else if (showSaved && savedCategory === "tours") {
      setPreviousView("tours");
    } else if (showMyTours) {
      setPreviousView("my-tours");
    } else if (showTourMenu) {
      setPreviousView("tour-menu");
    } else if (showTourSearch) {
      setPreviousView("tour-search");
    } else if (showRestaurantSearch) {
      setPreviousView("restaurant-search");
    } else if (showSearchMenu) {
      setPreviousView("search-menu");
    } else if (showSaved) {
      setPreviousView("saved-menu");
    } else {
      setPreviousView("search-menu");
    }

    // Force all overlapping views to close
    setShowItinerary(false);
    setShowMiniItinerary(false);
    setShowSaved(false);
    setShowTourMenu(false);
    setShowMyTours(false);
    setShowSearchMenu(false);
    setShowTourSearch(false);
    setShowRestaurantSearch(false);
    setSelectedTour(null);

    // Set the restaurant
    setSelectedRestaurant(restaurant);
  };

  const handleTourClick = (tour: any) => {
    if (showTourSearch) {
      setPreviousView("tour-search");
    } else {
      setPreviousView("tours");
    }
    setSelectedTour(tour);
    setShowSaved(false);
    setShowTourMenu(false);
    setShowTourSearch(false);
    setShowSearchMenu(false);
    setShowRestaurantSearch(false);
    setSavedCategory(null);
    setSelectedRestaurant(null);
    setShowItinerary(false);
  };

  const showSearchMenuPanel = () => {
    setShowSearchMenu(true);
    setShowRestaurantSearch(false);
    setShowTourSearch(false);
    setShowDishSearch(false);
    setShowSaved(false);
    setShowTourMenu(false);
    setShowMyTours(false);
    setShowItinerary(false);
    setShowMiniItinerary(false);
    setSelectedRestaurant(null);
    setSelectedTour(null);
    setSelectedDish(null);
    setSavedCategory(null);
  };

  const showTourMenuPanel = () => {
    setShowTourMenu(true);
    setShowSearchMenu(false);
    setShowRestaurantSearch(false);
    setShowTourSearch(false);
    setShowDishSearch(false);
    setShowSaved(false);
    setShowMyTours(false);
    setShowItinerary(false);
    setShowMiniItinerary(false);
    setSelectedRestaurant(null);
    setSelectedTour(null);
    setSelectedDish(null);
    setSavedCategory(null);
  };

  const showRestaurantSearchPanel = () => {
    setShowRestaurantSearch(true);
    setShowSearchMenu(false);
    setShowTourSearch(false);
    setShowDishSearch(false);
    setShowSaved(false);
    setShowTourMenu(false);
    setShowMyTours(false);
    setShowItinerary(false);
    setShowMiniItinerary(false);
    setSelectedRestaurant(null);
    setSelectedTour(null);
    setSelectedDish(null);
    setSavedCategory(null);
  };

  const showFullItineraryPanel = () => {
    setShowItinerary(true);
    setShowMiniItinerary(false);
    setShowTourMenu(false);
    setShowSaved(false);
    setShowMyTours(false);
    setShowSearchMenu(false);
    setShowRestaurantSearch(false);
    setShowTourSearch(false);
    setShowDishSearch(false);
    setSelectedRestaurant(null);
    setSelectedTour(null);
    setSelectedDish(null);
    setSavedCategory(null);
  };

  const handleItineraryBack = () => {
    setShowItinerary(false);
    setShowMiniItinerary(false);
    setShowTourMenu(true);
    setShowSaved(false);
    setShowMyTours(false);
    setShowSearchMenu(false);
    setShowRestaurantSearch(false);
    setShowTourSearch(false);
    setShowDishSearch(false);
    setSelectedRestaurant(null);
    setSelectedTour(null);
    setSelectedDish(null);
    setSavedCategory(null);
  };

  const showMiniItineraryPanel = () => {
    setShowMiniItinerary(true);
    setShowItinerary(false);
    setShowSaved(false);
    setShowTourMenu(false);
    setShowMyTours(false);
    setShowSearchMenu(false);
    setShowRestaurantSearch(false);
    setShowTourSearch(false);
    setShowDishSearch(false);
    setSelectedRestaurant(null);
    setSelectedTour(null);
    setSelectedDish(null);
  };

  const handleBackToResults = () => {
    // Go back to the previous view
    setSelectedRestaurant(null);
    setPreviousRestaurant(null);

    // Restore the previous view state
    if (previousView === "tour-detail") {
      // Going back to tour detail view
      setSelectedTour(previousTour);
      setPreviousTour(null);
      setShowSaved(false);
      setSavedCategory(null);
    } else if (previousView === "restaurant-detail") {
      setSelectedDish(null);
      setSelectedRestaurant(previousRestaurant);
      setPreviousRestaurant(null);
    } else if (previousView === "dish-search") {
      setShowDishSearch(true);
      setSelectedDish(null);
    } else if (previousView === "tour-menu") {
      setShowTourMenu(true);
      setSelectedTour(null);
    } else if (previousView === "tour-search") {
      setShowTourSearch(true);
      setSelectedTour(null);
    } else if (previousView === "restaurant-search") {
      setShowRestaurantSearch(true);
      setSelectedTour(null);
    } else if (previousView === "search-menu") {
      setShowSearchMenu(true);
      setSelectedTour(null);
    } else if (previousView === "favorites") {
      setShowSaved(true);
      setSavedCategory("favorites");
      setSelectedTour(null);
    } else if (previousView === "my-tours") {
      setShowMyTours(true);
      setSelectedTour(null);
    } else if (previousView === "tours") {
      // This handles back from tour detail -> "Saved Tours"
      setShowSaved(true);
      setSavedCategory("tours");
      setSelectedTour(null);
    } else if (previousView === "saved-menu") {
      setShowSaved(true);
      setSavedCategory(null);
      setSelectedTour(null);
    } else if (previousView === "current-itinerary") {
      showFullItineraryPanel();
    } else if (previousView === "dish-search") {
      setShowDishSearch(true);
      setSelectedDish(null);
    } else {
      // Default
      setShowSearchMenu(true);
      setShowSaved(false);
      setShowTourMenu(false);
      setShowTourSearch(false);
      setShowRestaurantSearch(false);
      setShowDishSearch(false);
      setSavedCategory(null);
      setSelectedTour(null);
      setSelectedDish(null);
    }
  };

  const handleToggleItinerary = () => {
    if (showMiniItinerary) {
      // Closing itinerary
      if (previousRestaurant) {
        setShowMiniItinerary(false);
        setSelectedRestaurant(previousRestaurant);
        setPreviousRestaurant(null);
      } else {
        showRestaurantSearchPanel();
      }
    } else {
      // Opening mini itinerary
      if (selectedRestaurant) {
        setPreviousRestaurant(selectedRestaurant);
      }
      showMiniItineraryPanel();
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-[calc(100vh-64px)] flex">
        {/* Left Panel - Search & Results */}
        <div
          className={`flex flex-col bg-white border-r border-gray-200 relative transition-all duration-300 ${isPanelCollapsed ? "w-20" : "w-full lg:w-[480px]"
            }`}
        >
          {/* Minimized Sidebar */}
          {isPanelCollapsed && (
            <CollapsedSidebar
              setIsPanelCollapsed={setIsPanelCollapsed}
              setShowSaved={setShowSaved}
              setSavedCategory={setSavedCategory}
              setShowMyTours={setShowMyTours}
              setShowItinerary={setShowItinerary}
              setShowTourMenu={setShowTourMenu}
              setShowSearchMenu={setShowSearchMenu}
              setShowTourSearch={setShowTourSearch}
              setShowRestaurantSearch={setShowRestaurantSearch}
              setShowDishSearch={setShowDishSearch}
              setSelectedRestaurant={setSelectedRestaurant}
              setSelectedTour={setSelectedTour}
              setSelectedDish={setSelectedDish}
              tourStops={tourStops}
            />
          )}

          {/* Expanded Sidebar Content */}
          {!isPanelCollapsed && (
            <>
              {/* Collapse Button */}
              <button
                onClick={() => setIsPanelCollapsed(true)}
                className="absolute -right-10 top-4 z-50 w-10 h-10 bg-white rounded-r-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-l-0 border-gray-200 hidden lg:flex"
                title="Minimize sidebar"
              >
                <PanelLeftClose className="w-5 h-5 text-gray-600" />
              </button>

              {/* Search Menu */}
              {showSearchMenu && !selectedRestaurant && !selectedTour && (
                <SearchMenu
                  setShowSearchMenu={setShowSearchMenu}
                  setShowRestaurantSearch={setShowRestaurantSearch}
                  setShowTourSearch={setShowTourSearch}
                  setShowDishSearch={setShowDishSearch}
                />
              )}

              {/* Tour Search Panel */}
              {showTourSearch && !selectedRestaurant && !selectedTour && (
                <TourSearchPanel
                  tourSearchQuery={tourSearchQuery}
                  setTourSearchQuery={setTourSearchQuery}
                  showTourFilters={showTourFilters}
                  setShowTourFilters={setShowTourFilters}
                  tourMinRating={tourMinRating}
                  setTourMinRating={setTourMinRating}
                  tourDurationFilter={tourDurationFilter}
                  setTourDurationFilter={setTourDurationFilter}
                  clearTourFilters={clearTourFilters}
                  filteredTours={filteredTours}
                  handleTourClick={handleTourClick}
                  setShowTourSearch={setShowTourSearch}
                  setShowSearchMenu={setShowSearchMenu}
                />
              )}

              {/* Dish Search Panel */}
              {showDishSearch && !selectedRestaurant && !selectedTour && !selectedDish && (
                <DishSearchPanel
                  dishSearchQuery={dishSearchQuery}
                  setDishSearchQuery={setDishSearchQuery}
                  showDishFilters={showDishFilters}
                  setShowDishFilters={setShowDishFilters}
                  dishCuisine={dishCuisine}
                  setDishCuisine={setDishCuisine}
                  dishPreference={dishPreference}
                  setDishPreference={setDishPreference}
                  dishBudget={dishBudget}
                  setDishBudget={setDishBudget}
                  dishLocation={dishLocation}
                  setDishLocation={setDishLocation}
                  dishDistance={dishDistance}
                  setDishDistance={setDishDistance}
                  clearDishFilters={clearDishFilters}
                  filteredDishes={filteredDishes}
                  setSelectedDish={setSelectedDish}
                  setPreviousView={setPreviousView}
                  setShowDishSearch={setShowDishSearch}
                  setShowSearchMenu={setShowSearchMenu}
                />
              )}

              {/* Restaurant Search Panel */}
              {showRestaurantSearch && !selectedRestaurant && !selectedTour && (
                <RestaurantSearchPanel
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  selectedPrice={selectedPrice}
                  setSelectedPrice={setSelectedPrice}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              selectedCuisine={selectedCuisine}
              setSelectedCuisine={setSelectedCuisine}
              onlyOpen={onlyOpen}
              setOnlyOpen={setOnlyOpen}
              clearFilters={clearFilters}
                  filteredRestaurants={filteredRestaurants}
                  tourStops={tourStops}
                  showItinerary={showItinerary}
                  handleToggleItinerary={handleToggleItinerary}
                  handleRestaurantClick={handleRestaurantClick}
                  toggleRestaurantSelection={toggleRestaurantSelection}
                  setShowRestaurantSearch={setShowRestaurantSearch}
                  setShowSearchMenu={setShowSearchMenu}
                />
              )}

              {/* Main Content Area - Toggle between Results, Itinerary, and Detail */}
              <div className="flex-1 overflow-y-auto">
                {showSaved ? (
                  <div className="p-4">
                    <SavedPanel
                      savedCategory={savedCategory}
                      favoriteRestaurants={favoriteRestaurants}
                      savedTours={savedTours}
                      handleRestaurantClick={handleRestaurantClick}
                      removeFavorite={removeFavorite}
                      removeSavedTour={removeSavedTour}
                      handleTourClick={handleTourClick}
                      setShowSaved={setShowSaved}
                      setSavedCategory={setSavedCategory}
                      setShowSearchMenu={setShowSearchMenu}
                      setShowTourMenu={setShowTourMenu}
                    />
                  </div>
                ) : showTourMenu ? (
                  <TourMenuPanel
                    tourStops={tourStops}
                    myTours={myTours}
                    savedTours={savedTours}
                    setShowTourMenu={setShowTourMenu}
                    setShowSearchMenu={setShowSearchMenu}
                    setShowItinerary={setShowItinerary}
                    setShowMiniItinerary={setShowMiniItinerary}
                    setShowMyTours={setShowMyTours}
                    setShowSaved={setShowSaved}
                    setSavedCategory={setSavedCategory}
                  />
                ) : showMyTours ? (
                  <MyToursPanel
                    myTours={myTours}
                    setShowMyTours={setShowMyTours}
                    setShowTourMenu={setShowTourMenu}
                    setPreviousView={setPreviousView}
                    setSelectedTour={setSelectedTour}
                    handleEditMyTour={handleEditMyTour}
                    handleDeleteMyTour={handleDeleteMyTour}
                    handleRestaurantClick={handleRestaurantClick}
                  />
                ) : selectedTour ? (
                  <TourDetailPanel
                    selectedTour={selectedTour}
                    myTours={myTours}
                    savedTours={savedTours}
                    setSavedTours={setSavedTours}
                    handleBackToResults={handleBackToResults}
                    handleRestaurantClick={handleRestaurantClick}
                    getTourRestaurants={getTourRestaurants}
                    loadTour={loadTour}
                    handleEditMyTour={handleEditMyTour}
                    handleDeleteMyTour={handleDeleteMyTour}
                    handleToggleTourPrivacy={handleToggleTourPrivacy}
                    removeSavedTour={removeSavedTour}
                    setShowMyTours={setShowMyTours}
                    setSelectedTour={setSelectedTour}
                  />
                ) : selectedDish ? (
                  <DishDetailPanel
                    selectedDish={selectedDish}
                    handleBackToResults={handleBackToResults}
                    setSelectedDish={setSelectedDish}
                    setPreviousView={setPreviousView}
                    setSelectedRestaurant={setSelectedRestaurant}
                  />
                ) : selectedRestaurant ? (
                  <RestaurantDetailPanel
                    selectedRestaurant={selectedRestaurant}
                    tourStops={tourStops}
                    handleBackToResults={handleBackToResults}
                    toggleRestaurantSelection={toggleRestaurantSelection}
                    setPreviousRestaurant={setPreviousRestaurant}
                    setPreviousView={setPreviousView}
                    setSelectedRestaurant={setSelectedRestaurant}
                    setSelectedDish={setSelectedDish}
                  />
                ) : showMiniItinerary ? (
                  <MiniItineraryPanel
                    tourStops={tourStops}
                    onBack={handleToggleItinerary}
                    onFindRestaurants={showRestaurantSearchPanel}
                    onOpenFullItinerary={showFullItineraryPanel}
                  />
                ) : showItinerary ? (
                  <ItineraryPanel
                    tourStops={tourStops}
                    tourName={tourName}
                    tourDescription={tourDescription}
                    setTourDescription={setTourDescription}
                    tourTags={tourTags}
                    setTourTags={setTourTags}
                    availableTags={availableTags}
                    isEditingName={isEditingName}
                    setIsEditingName={setIsEditingName}
                    tempName={tempName}
                    setTempName={setTempName}
                    handleNameSave={handleNameSave}
                    handleNameCancel={handleNameCancel}
                    moveStop={moveStop}
                    syncStopOrder={syncStopOrder}
                    removeStop={removeStop}
                    handleRestaurantClick={handleRestaurantClick}
                    optimizeRoute={optimizeRoute}
                    handleSaveTour={handleSaveTour}
                    editingTourId={editingTourId}
                    setShowItinerary={setShowItinerary}
                    setShowTourMenu={setShowTourMenu}
                    setShowSaved={setShowSaved}
                    setShowMyTours={setShowMyTours}
                    setSelectedTour={setSelectedTour}
                    setSelectedRestaurant={setSelectedRestaurant}
                    onBack={handleItineraryBack}
                    onFindRestaurants={showRestaurantSearchPanel}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8" />
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Map */}
        <MapPanel
          filteredRestaurants={filteredRestaurants}
          tourStops={tourStops}
          selectedRestaurant={selectedRestaurant}
          selectedTour={selectedTour}
          tourName={tourName}
          handleMapDotClick={handleMapDotClick}
          toggleRestaurantSelection={toggleRestaurantSelection}
          getTourRestaurants={getTourRestaurants}
        />
      </div>
    </DndProvider>
  );
};
