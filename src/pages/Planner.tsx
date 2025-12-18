"use client";

import { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  X,
  GripVertical,
  Clock,
  Map,
  Sparkles,
  Save,
  Edit2,
  Navigation,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Heart,
  Bookmark,
  Trash2,
  FolderOpen,
  Utensils,
  Route,
  Soup,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  MOCK_RESTAURANTS,
  type Restaurant,
  MOCK_TOURS,
} from "../lib/data";
import { toast } from "sonner";

// Draggable Stop Component
const DraggableStop = ({
  stop,
  index,
  moveStop,
  removeStop,
  onStopClick,
}: {
  stop: Restaurant;
  index: number;
  moveStop: (dragIndex: number, hoverIndex: number) => void;
  removeStop: (id: string) => void;
  onStopClick: (stop: Restaurant) => void;
}) => {
  const [, ref] = useDrag({
    type: "STOP",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "STOP",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveStop(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3 mb-3 cursor-grab active:cursor-grabbing hover:border-[#FF6B35] transition-colors"
    >
      <div className="text-gray-300 cursor-grab">
        <GripVertical className="w-5 h-5" />
      </div>
      <div
        className="flex flex-1 items-center gap-3 min-w-0 cursor-pointer"
        onClick={() => onStopClick(stop)}
      >
        <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-gray-100">
          <img
            src={stop.image || "/placeholder.svg"}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 text-sm truncate hover:text-[#FF6B35] transition-colors">
            {stop.name}
          </h4>
          <p className="text-xs text-gray-500">Est. 1 hour</p>
        </div>
      </div>
      <button
        onClick={() => removeStop(stop.id)}
        className="text-gray-400 hover:text-red-500 p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const Planner = () => {
  const location = useLocation();

  // Tour state
  const [tourStops, setTourStops] = useState<Restaurant[]>([]);
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

  // Initialize favorites with all MOCK_RESTAURANTS (same as Profile page)
  const [favoriteRestaurants, setFavoriteRestaurants] =
    useState<Restaurant[]>(MOCK_RESTAURANTS);
  // Initialize saved tours with all MOCK_TOURS (same as Profile page)
  const [savedTours, setSavedTours] =
    useState<any[]>(MOCK_TOURS);

  // Track which saved category is being viewed: null | 'favorites' | 'tours'
  const [savedCategory, setSavedCategory] = useState<
    "favorites" | "tours" | null
  >(null);

  // My Tours state
  const [showMyTours, setShowMyTours] = useState(false);
  const [myTours, setMyTours] = useState<any[]>([]);

  // Load my tours from local storage
  useEffect(() => {
    const storedTours = JSON.parse(
      localStorage.getItem("savedTours") || "[]",
    );
    setMyTours(storedTours);
  }, []);

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
  const removeFavorite = (id: string) => {
    setFavoriteRestaurants((prev) =>
      prev.filter((r) => r.id !== id),
    );
    toast.success("Removed from favorites");
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
      tourRestaurants = MOCK_RESTAURANTS.slice(0, 5);
    } else if (tour.id === "t2") {
      // Hidden Coffee Gems - 3 coffee-related restaurants
      tourRestaurants = MOCK_RESTAURANTS.filter(
        (r) =>
          r.tags.includes("Coffee") ||
          r.name.toLowerCase().includes("coffee"),
      ).slice(0, 3);
    } else if (tour.id === "t3") {
      // Vegetarian Delights - 4 different restaurants
      tourRestaurants = MOCK_RESTAURANTS.slice(2, 6);
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

    toast.success(`Loaded "${tour.title}"!`);
  };

  // Get tour restaurants for display
  const getTourRestaurants = (tour: any): Restaurant[] => {
    if (tour.stops && Array.isArray(tour.stops)) {
      return tour.stops;
    }
    if (tour.id === "t1") {
      return MOCK_RESTAURANTS.slice(0, 5);
    } else if (tour.id === "t2") {
      return MOCK_RESTAURANTS.filter(
        (r) =>
          r.tags.includes("Coffee") ||
          r.name.toLowerCase().includes("coffee"),
      ).slice(0, 3);
    } else if (tour.id === "t3") {
      return MOCK_RESTAURANTS.slice(2, 6);
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
  const filteredRestaurants = MOCK_RESTAURANTS.filter((r) => {
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
    const allTours = [...MOCK_TOURS];
    // Add user's created tours that aren't already in MOCK_TOURS
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

    MOCK_RESTAURANTS.forEach((repo) => {
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
  const moveStop = (dragIndex: number, hoverIndex: number) => {
    const dragStop = tourStops[dragIndex];
    const newStops = [...tourStops];
    newStops.splice(dragIndex, 1);
    newStops.splice(hoverIndex, 0, dragStop);
    setTourStops(newStops);
  };

  const removeStop = (id: string) => {
    setTourStops(tourStops.filter((s) => s.id !== id));
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

  const optimizeRoute = () => {
    const sorted = [...tourStops].sort((a, b) => a.lat - b.lat);
    setTourStops(sorted);
    toast.success("Route optimized!");
  };

  const handleSaveTour = () => {
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

  const handleDeleteMyTour = (id: string) => {
    const newTours = myTours.filter((t) => t.id !== id);
    setMyTours(newTours);
    localStorage.setItem(
      "savedTours",
      JSON.JSON.stringify(newTours),
    );
    toast.success("Tour deleted");
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
      setShowItinerary(true);
      setShowTourMenu(false);
      setSelectedTour(null);
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
      setShowMiniItinerary(false);
      if (previousRestaurant) {
        setSelectedRestaurant(previousRestaurant);
        setPreviousRestaurant(null);
      }
    } else {
      // Opening mini itinerary
      if (selectedRestaurant) {
        setPreviousRestaurant(selectedRestaurant);
      }
      setShowMiniItinerary(true);
      setShowItinerary(false);
      setSelectedRestaurant(null);
      setShowSaved(false);
      setShowTourMenu(false);
      setSelectedTour(null);
      setShowMyTours(false);
      setShowSearchMenu(false);
      setShowRestaurantSearch(false);
      setShowTourSearch(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-[calc(100vh-64px)] flex">
        {/* Left Panel - Search & Results */}
        <div
          className={`flex flex-col bg-white border-r border-gray-200 relative transition-all duration-300 ${
            isPanelCollapsed ? "w-20" : "w-full lg:w-[480px]"
          }`}
        >
          {/* Minimized Sidebar */}
          {isPanelCollapsed && (
            <div className="flex flex-col items-center py-6 gap-6 h-full">
              {/* Expand Button */}
              <button
                onClick={() => setIsPanelCollapsed(false)}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                title="Expand menu"
              >
                <PanelLeftOpen className="w-6 h-6 text-gray-600" />
              </button>

              {/* Saved/Favorites Section */}
              <button
                onClick={() => {
                  setIsPanelCollapsed(false);
                  setShowSaved(true);
                  setSavedCategory("favorites");
                  setShowMyTours(false);
                  setShowItinerary(false);
                  setShowTourMenu(false);
                  setShowSearchMenu(false);
                  setShowTourSearch(false);
                  setShowRestaurantSearch(false);
                  setSelectedRestaurant(null);
                }}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Favorites"
              >
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center group-hover:bg-pink-600 transition-colors">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-gray-600 text-center leading-tight">
                  Saved
                </span>
              </button>

              {/* Tour Menu Section */}
              <button
                onClick={() => {
                  setIsPanelCollapsed(false);
                  setShowTourMenu(true);
                  setShowSaved(false);
                  setShowMyTours(false);
                  setShowItinerary(false);
                  setShowSearchMenu(false);
                  setShowTourSearch(false);
                  setShowRestaurantSearch(false);
                  setSelectedRestaurant(null);
                }}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Tour Menu"
              >
                <div className="w-12 h-12 bg-[#2E86AB] rounded-lg flex items-center justify-center group-hover:bg-[#236B8A] transition-colors">
                  <Map className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-gray-600 text-center leading-tight">
                  Tour
                </span>
              </button>

              <button
                onClick={() => {
                  setIsPanelCollapsed(false);
                  setShowSearchMenu(true);
                  setShowRestaurantSearch(false);
                  setShowTourSearch(false);
                  setShowDishSearch(false);
                  setShowItinerary(false);
                  setShowSaved(false);
                  setShowMyTours(false);
                  setShowTourMenu(false);
                  setSelectedRestaurant(null);
                  setSelectedTour(null);
                  setSelectedDish(null);
                }}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Search"
              >
                <div className="w-12 h-12 bg-[#FF6B35] rounded-lg flex items-center justify-center group-hover:bg-[#e55a2b] transition-colors">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-gray-600 text-center leading-tight">
                  Search
                </span>
              </button>

              {/* Active Itinerary Indicator */}
              {tourStops.length > 0 && (
                <button
                  onClick={() => {
                    setIsPanelCollapsed(false);
                    setShowItinerary(true);
                    setShowSaved(false);
                    setShowMyTours(false);
                    setShowTourMenu(false);
                    setShowSearchMenu(false);
                    setShowTourSearch(false);
                    setShowRestaurantSearch(false);
                    setSelectedRestaurant(null);
                  }}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-lg transition-colors group relative"
                  title="View itinerary"
                >
                  <div className="w-12 h-12 bg-white border-2 border-[#2E86AB] rounded-lg flex items-center justify-center group-hover:bg-[#2E86AB]/10 transition-colors relative">
                    <MapPin className="w-6 h-6 text-[#2E86AB]" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {tourStops.length}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 text-center leading-tight">
                    Active
                  </span>
                </button>
              )}
            </div>
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

              {/* Search Menu - The 2 Options */}
              {showSearchMenu &&
                !selectedRestaurant &&
                !selectedTour && (
                  <div className="flex-1 flex flex-col">
                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Search
                      </h2>
                      <p className="text-gray-500 mb-6">
                        What would you like to find?
                      </p>

                      <div className="space-y-4">
                        {/* Search Restaurants Option */}
                        <button
                          onClick={() => {
                            setShowSearchMenu(false);
                            setShowRestaurantSearch(true);
                            setShowTourSearch(false);
                          }}
                          className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#FF6B35] hover:bg-orange-50/50 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#FF6B35] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Utensils className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="font-bold text-gray-900 text-lg">
                                Search Restaurants
                              </h3>
                              <p className="text-sm text-gray-500">
                                Find restaurants by name,
                                cuisine, or location
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#FF6B35] transition-colors" />
                          </div>
                        </button>

                        {/* Search Tours Option */}
                        <button
                          onClick={() => {
                            setShowSearchMenu(false);
                            setShowTourSearch(true);
                            setShowRestaurantSearch(false);
                          }}
                          className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#2E86AB] hover:bg-blue-50/50 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#2E86AB] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Route className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="font-bold text-gray-900 text-lg">
                                Search Tours
                              </h3>
                              <p className="text-sm text-gray-500">
                                Discover curated food tours and
                                itineraries
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#2E86AB] transition-colors" />
                          </div>
                        </button>

                        {/* Search Dishes Option */}
                        <button
                          onClick={() => {
                            setShowSearchMenu(false);
                            setShowDishSearch(true);
                            setShowRestaurantSearch(false);
                            setShowTourSearch(false);
                          }}
                          className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Soup className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="font-bold text-gray-900 text-lg">
                                Search Dishes
                              </h3>
                              <p className="text-sm text-gray-500">
                                Find specific foods and where to
                                eat them
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              {/* Tour Search Panel */}
              {showTourSearch &&
                !selectedRestaurant &&
                !selectedTour && (
                  <div className="flex-1 flex flex-col h-full relative">
                    {/* Header & Search Bar */}
                    <div className="p-4 border-b border-gray-200 bg-white z-20 relative">
                      <button
                        onClick={() => {
                          setShowTourSearch(false);
                          setShowSearchMenu(true);
                        }}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back to Search</span>
                      </button>

                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 ring-[#2E86AB]/50">
                          <Search className="w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search tours..."
                            value={tourSearchQuery}
                            onChange={(e) =>
                              setTourSearchQuery(e.target.value)
                            }
                            className="flex-1 outline-none"
                          />
                        </div>
                        <button
                          onClick={() =>
                            setShowTourFilters(!showTourFilters)
                          }
                          className={`px-3 md:px-4 py-3 rounded-lg border flex items-center gap-2 transition-colors ${
                            showTourFilters
                              ? "bg-[#2E86AB] text-white border-[#2E86AB]"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <SlidersHorizontal className="w-5 h-5" />
                          <span className="hidden md:inline">
                            Filters
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <p className="text-gray-600 text-sm">
                          Found{" "}
                          <span className="font-medium text-gray-900">
                            {filteredTours.length}
                          </span>{" "}
                          tours
                        </p>
                      </div>

                      {/* Filter Overlay (Absolute position relative to Header) */}
                      {showTourFilters && (
                        <div className="absolute top-full left-0 right-0 z-50 bg-white shadow-xl border-b border-gray-200 animate-in slide-in-from-top-2">
                          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>
                              <label className="block text-sm text-gray-700 mb-2">
                                Minimum Rating:{" "}
                                {tourMinRating > 0
                                  ? tourMinRating
                                  : "All"}
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="5"
                                step="0.5"
                                value={tourMinRating}
                                onChange={(e) =>
                                  setTourMinRating(
                                    Number(e.target.value),
                                  )
                                }
                                className="w-full accent-[#2E86AB]"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-700 mb-2">
                                Duration
                              </label>
                              <div className="flex gap-2">
                                {[
                                  { value: "", label: "All" },
                                  {
                                    value: "short",
                                    label: "< 2h",
                                  },
                                  {
                                    value: "medium",
                                    label: "2-3h",
                                  },
                                  {
                                    value: "long",
                                    label: "> 3h",
                                  },
                                ].map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() =>
                                      setTourDurationFilter(
                                        tourDurationFilter ===
                                          option.value
                                          ? ""
                                          : option.value,
                                      )
                                    }
                                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors text-sm ${
                                      tourDurationFilter ===
                                      option.value
                                        ? "bg-[#2E86AB] text-white border-[#2E86AB]"
                                        : "bg-white border-gray-300 hover:bg-gray-100"
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={clearTourFilters}
                              className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 text-sm border-t border-gray-200 pt-3"
                            >
                              Clear filters
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tour Results List */}
                    <div className="flex-1 overflow-y-auto p-4 z-0">
                      {filteredTours.length === 0 ? (
                        <div className="mt-12 text-center text-gray-500">
                          <Route className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="font-medium">
                            No tours found
                          </p>
                          <p className="text-sm mt-2">
                            Try adjusting your filters
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredTours.map((tour) => (
                            <div
                              key={tour.id}
                              className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:border-[#2E86AB] transition-colors cursor-pointer"
                              onClick={() =>
                                handleTourClick(tour)
                              }
                            >
                              <div className="h-32 overflow-hidden bg-gray-100">
                                <img
                                  src={
                                    tour.image ||
                                    "/placeholder.svg"
                                  }
                                  alt={tour.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-4">
                                <h3 className="font-bold text-gray-900 mb-2">
                                  {tour.title || tour.name}
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    <span className="font-medium text-gray-900">
                                      {tour.rating}
                                    </span>
                                  </div>
                                  <span className="text-gray-300">
                                    •
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {tour.duration || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Dish Search Panel */}
              {showDishSearch &&
                !selectedRestaurant &&
                !selectedTour &&
                !selectedDish && (
                  <div className="flex-1 flex flex-col h-full relative">
                    {/* Header & Search Bar */}
                    <div className="p-4 border-b border-gray-200 bg-white z-20 relative">
                      <button
                        onClick={() => {
                          setShowDishSearch(false);
                          setShowSearchMenu(true);
                        }}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back to Search</span>
                      </button>

                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 ring-emerald-500/50">
                          <Search className="w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search for dishes (e.g. Phở)..."
                            value={dishSearchQuery}
                            onChange={(e) =>
                              setDishSearchQuery(e.target.value)
                            }
                            className="flex-1 outline-none"
                          />
                        </div>
                        <button
                          onClick={() =>
                            setShowDishFilters(!showDishFilters)
                          }
                          className={`px-3 md:px-4 py-3 rounded-lg border flex items-center gap-2 transition-colors ${
                            showDishFilters
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <SlidersHorizontal className="w-5 h-5" />
                          <span className="hidden md:inline">
                            Filters
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <p className="text-gray-600 text-sm">
                          Found{" "}
                          <span className="font-medium text-gray-900">
                            {filteredDishes.length}
                          </span>{" "}
                          dishes
                        </p>
                      </div>

                      {/* Dish Filters Drop-down */}
                      {showDishFilters && (
                        <div className="bg-gray-50 border-b border-gray-200 animate-in slide-in-from-top-2 duration-200">
                          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Cuisine */}
                            <div>
                              <label className="block text-sm text-gray-700 mb-2">
                                Cuisine
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {dishCuisines.map((c) => (
                                  <button
                                    key={c}
                                    onClick={() =>
                                      setDishCuisine(
                                        dishCuisine === c
                                          ? ""
                                          : c,
                                      )
                                    }
                                    className={`px-3 py-1.5 rounded-full text-xs border ${dishCuisine === c ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300"}`}
                                  >
                                    {c}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Preferences */}
                            <div>
                              <label className="block text-sm text-gray-700 mb-2">
                                Preferences
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {dishPreferences.map((p) => (
                                  <button
                                    key={p}
                                    onClick={() =>
                                      setDishPreference(
                                        dishPreference === p
                                          ? ""
                                          : p,
                                      )
                                    }
                                    className={`px-3 py-1.5 rounded-full text-xs border ${dishPreference === p ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300"}`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Budget */}
                            <div>
                              <label className="block text-sm text-gray-700 mb-2">
                                Budget
                              </label>
                              <select
                                value={dishBudget}
                                onChange={(e) =>
                                  setDishBudget(e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                              >
                                <option value="">Any</option>
                                {dishBudgets.map((b) => (
                                  <option key={b} value={b}>
                                    {b}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Location & Open At */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm text-gray-700 mb-2">
                                  Location
                                </label>
                                <select
                                  value={dishLocation}
                                  onChange={(e) =>
                                    setDishLocation(
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                >
                                  <option value="">Any</option>
                                  {districts.map((d) => (
                                    <option key={d} value={d}>
                                      {d}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-2">
                                  Distance
                                </label>
                                <select
                                  value={dishDistance}
                                  onChange={(e) =>
                                    setDishDistance(
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                >
                                  <option value="">Any</option>
                                  {dishDistances.map((d) => (
                                    <option key={d} value={d}>
                                      ≤ {d} km
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <button
                              onClick={clearDishFilters}
                              className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 text-sm border-t border-gray-200 pt-3"
                            >
                              Clear filters
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dish Results List */}
                    <div className="flex-1 overflow-y-auto z-0">
                      {filteredDishes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                          <Soup className="w-16 h-16 mb-4 text-gray-300" />
                          <p className="text-center font-medium">
                            No dishes found
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {filteredDishes.map(
                            (dish: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                                onClick={() => {
                                  setSelectedDish(dish);
                                  setPreviousView(
                                    "dish-search",
                                  );
                                  setShowDishSearch(false);
                                }}
                              >
                                <div className="flex gap-4">
                                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                      src={dish.image}
                                      alt={dish.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                                      {dish.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                      {dish.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                      <span className="text-emerald-600 font-bold text-sm">
                                        {new Intl.NumberFormat(
                                          "vi-VN",
                                          {
                                            style: "currency",
                                            currency: "VND",
                                          },
                                        ).format(dish.minPrice)}
                                        {dish.minPrice !==
                                          dish.maxPrice &&
                                          ` - ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(dish.maxPrice)}`}
                                      </span>
                                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {
                                          dish.restaurants
                                            .length
                                        }{" "}
                                        places
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Restaurant Search Panel */}
              {showRestaurantSearch &&
                !selectedRestaurant &&
                !selectedTour && (
                  <div className="flex-1 flex flex-col h-full relative">
                    {/* Header & Search Bar */}
                    <div className="p-4 border-b border-gray-200 bg-white z-20 relative">
                      <button
                        onClick={() => {
                          setShowRestaurantSearch(false);
                          setShowSearchMenu(true);
                        }}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back to Search</span>
                      </button>

                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 ring-[#FF6B35]/50">
                          <Search className="w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search restaurants..."
                            value={searchQuery}
                            onChange={(e) =>
                              setSearchQuery(e.target.value)
                            }
                            className="flex-1 outline-none"
                          />
                        </div>
                        <button
                          onClick={() =>
                            setShowFilters(!showFilters)
                          }
                          className={`px-3 md:px-4 py-3 rounded-lg border flex items-center gap-2 transition-colors ${
                            showFilters
                              ? "bg-[#FF6B35] text-white border-[#FF6B35]"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <SlidersHorizontal className="w-5 h-5" />
                          <span className="hidden md:inline">
                            Filters
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <p className="text-gray-600 text-sm">
                          Found{" "}
                          <span className="font-medium text-gray-900">
                            {filteredRestaurants.length}
                          </span>{" "}
                          restaurants
                        </p>
                        {tourStops.length > 0 && (
                          <button
                            onClick={handleToggleItinerary}
                            className="bg-[#2E86AB] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-[#236B8A] transition-colors text-sm flex items-center gap-1 md:gap-2"
                          >
                            <MapPin className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              Itinerary
                            </span>
                            <span className="sm:hidden">
                              Tour
                            </span>
                            ({tourStops.length})
                            {showItinerary ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Filter Overlay (Absolute position relative to Header) */}
                      {showFilters && (
                        <div className="absolute top-full left-0 right-0 z-50 bg-white shadow-xl border-b border-gray-200 animate-in slide-in-from-top-2">
                          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>
                              <label className="block text-sm text-gray-700 mb-2">
                                Price
                              </label>
                              <div className="flex gap-2">
                                {priceRanges.map((p) => (
                                  <button
                                    key={p}
                                    onClick={() =>
                                      setSelectedPrice(
                                        selectedPrice === p
                                          ? ""
                                          : p,
                                      )
                                    }
                                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                                      selectedPrice === p
                                        ? "bg-[#FF6B35] text-white border-[#FF6B35]"
                                        : "bg-white border-gray-300 hover:bg-gray-100"
                                    }`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-700 mb-2">
                                Minimum Rating:{" "}
                                {minRating > 0
                                  ? minRating
                                  : "All"}
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="5"
                                step="0.5"
                                value={minRating}
                                onChange={(e) =>
                                  setMinRating(
                                    Number(e.target.value),
                                  )
                                }
                                className="w-full accent-[#FF6B35]"
                              />
                            </div>
                            <button
                              onClick={clearFilters}
                              className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 text-sm border-t border-gray-200 pt-3"
                            >
                              Clear filters
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Restaurant Results List */}
                    <div className="flex-1 overflow-y-auto z-0">
                      {filteredRestaurants.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                          <Search className="w-16 h-16 mb-4 text-gray-300" />
                          <p className="text-center font-medium">
                            No results found
                          </p>
                        </div>
                      ) : (
                        filteredRestaurants.map(
                          (restaurant) => {
                            const isSelected = tourStops.find(
                              (s) => s.id === restaurant.id,
                            );
                            return (
                              <div
                                key={restaurant.id}
                                className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}
                              >
                                <div className="flex gap-4">
                                  <div
                                    className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer"
                                    onClick={() =>
                                      handleRestaurantClick(
                                        restaurant,
                                      )
                                    }
                                  >
                                    <img
                                      src={
                                        restaurant.image ||
                                        "/placeholder.svg"
                                      }
                                      alt={restaurant.name}
                                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <button
                                        onClick={() =>
                                          handleRestaurantClick(
                                            restaurant,
                                          )
                                        }
                                        className="font-medium text-gray-900 hover:text-[#FF6B35] line-clamp-1 transition-colors text-left"
                                      >
                                        {restaurant.name}
                                      </button>
                                      <button
                                        onClick={() =>
                                          toggleRestaurantSelection(
                                            restaurant,
                                          )
                                        }
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors flex-shrink-0 ${
                                          isSelected
                                            ? "bg-[#2E86AB] text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                      >
                                        {isSelected
                                          ? "✓ Added"
                                          : "+ Add"}
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                      <span>
                                        {restaurant.rating}
                                      </span>
                                      <span className="text-gray-400">
                                        •
                                      </span>
                                      <span>
                                        {restaurant.priceRange}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Main Content Area - Toggle between Results, Itinerary, and Detail */}
              <div className="flex-1 overflow-y-auto">
                {showSaved ? (
                  // Saved View - Favorites & Saved Tours
                  <div className="p-4">
                    {savedCategory === "favorites" ? (
                      // Favorites List View
                      <>
                        <button
                          onClick={() => {
                            setShowSaved(false);
                            setSavedCategory(null);
                            setShowSearchMenu(true);
                          }}
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          <span>Back</span>
                        </button>

                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-gray-900">
                            Favorites
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            {favoriteRestaurants.length} place
                            {favoriteRestaurants.length !== 1
                              ? "s"
                              : ""}
                          </p>
                        </div>

                        {favoriteRestaurants.length === 0 ? (
                          <div className="mt-12 text-center text-gray-500">
                            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium">
                              No favorites yet
                            </p>
                            <p className="text-sm mt-2">
                              Save your favorite restaurants to
                              find them easily later
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {favoriteRestaurants.map(
                              (restaurant) => (
                                <div
                                  key={restaurant.id}
                                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-[#FF6B35] transition-colors cursor-pointer"
                                  onClick={() =>
                                    handleRestaurantClick(
                                      restaurant,
                                    )
                                  }
                                >
                                  <div className="flex gap-3">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                      <img
                                        src={
                                          restaurant.image ||
                                          "/placeholder.svg"
                                        }
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-medium text-gray-900 hover:text-[#FF6B35] line-clamp-1 transition-colors">
                                          {restaurant.name}
                                        </h3>
                                      </div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center gap-1 text-yellow-500">
                                          <Star className="w-3.5 h-3.5 fill-current" />
                                          <span className="text-gray-900 text-sm">
                                            {restaurant.rating}
                                          </span>
                                        </div>
                                        <span className="text-gray-400 text-xs">
                                          •
                                        </span>
                                        <span className="text-gray-600 text-sm">
                                          {
                                            restaurant.priceRange
                                          }
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-1 mb-2">
                                        {restaurant.tags
                                          .slice(0, 2)
                                          .map((tag, idx) => (
                                            <span
                                              key={idx}
                                              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeFavorite(
                                            restaurant.id,
                                          );
                                        }}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        Remove from favorites
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      // Saved Tours List View
                      <>
                        <button
                          onClick={() => {
                            setShowSaved(false);
                            setSavedCategory(null);
                            setShowTourMenu(true);
                          }}
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          <span>Back</span>
                        </button>

                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-gray-900">
                            Saved Tours
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            {savedTours.length} tour
                            {savedTours.length !== 1 ? "s" : ""}
                          </p>
                        </div>

                        {savedTours.length === 0 ? (
                          <div className="mt-12 text-center text-gray-500">
                            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium">
                              No saved tours yet
                            </p>
                            <p className="text-sm mt-2">
                              Create and save tours to access
                              them quickly later
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {savedTours.map((tour) => (
                              <div
                                key={tour.id}
                                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-[#2E86AB] transition-colors cursor-pointer"
                                onClick={() =>
                                  handleTourClick(tour)
                                }
                              >
                                <div className="flex gap-3">
                                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                    <img
                                      src={
                                        tour.image ||
                                        "/placeholder.svg"
                                      }
                                      alt={tour.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-1">
                                      {tour.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {tour.duration}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {tour.stops} stops
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span className="text-gray-900 text-sm">
                                          {tour.rating}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeSavedTour(
                                          tour.id,
                                        );
                                      }}
                                      className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      Remove from saved tours
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : showTourMenu ? (
                  // Tour Menu (Itinerary, My Tours, Saved Tours)
                  <div className="p-4">
                    <button
                      onClick={() => {
                        setShowTourMenu(false);
                        setShowSearchMenu(true);
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Back</span>
                    </button>

                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Tour
                    </h2>

                    {/* Current Itinerary Link */}
                    <div className="mb-6">
                      <button
                        onClick={() => {
                          setShowTourMenu(false);
                          setShowItinerary(true);
                          setShowMiniItinerary(false);
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#2E86AB]/10 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-[#2E86AB]" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-gray-900">
                              Current Itinerary
                            </h3>
                            <p className="text-sm text-gray-500">
                              {tourStops.length > 0
                                ? `${tourStops.length} stop${tourStops.length !== 1 ? "s" : ""} • Active`
                                : "Empty"}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    </div>

                    {/* My Tours Link */}
                    <div className="mb-6">
                      <button
                        onClick={() => {
                          setShowTourMenu(false);
                          setShowMyTours(true);
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                            <FolderOpen className="w-6 h-6 text-purple-500" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-gray-900">
                              My Tours
                            </h3>
                            <p className="text-sm text-gray-500">
                              Private • {myTours.length} created
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    </div>

                    {/* Saved Tours Link */}
                    <div>
                      <button
                        onClick={() => {
                          setShowTourMenu(false);
                          setShowSaved(true);
                          setSavedCategory("tours");
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
                            <Bookmark className="w-6 h-6 text-teal-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-gray-900">
                              Saved Tours
                            </h3>
                            <p className="text-sm text-gray-500">
                              Public • {savedTours.length} saved
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    </div>
                  </div>
                ) : showMyTours ? (
                  // My Tours View
                  <div className="p-4">
                    <button
                      onClick={() => {
                        setShowMyTours(false);
                        setShowTourMenu(true);
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Back</span>
                    </button>

                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        My Tours
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        You have {myTours.length} created tour
                        {myTours.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {myTours.length === 0 ? (
                      <div className="mt-12 text-center text-gray-500">
                        <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">
                          No tours created yet
                        </p>
                        <p className="text-sm mt-2">
                          Create a tour and save it to see it
                          here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[...myTours]
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt).getTime() -
                              new Date(a.createdAt).getTime(),
                          )
                          .map((tour) => (
                            <div
                              key={tour.id}
                              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-purple-500 transition-colors cursor-pointer"
                              onClick={() => {
                                setPreviousView("my-tours");
                                setSelectedTour(tour);
                                setShowMyTours(false);
                                setShowTourMenu(false);
                              }}
                            >
                              <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-medium text-gray-900 mb-1">
                                      {tour.name}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(
                                          tour.createdAt,
                                        ).toLocaleDateString()}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {tour.stops.length}{" "}
                                        stops
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditMyTour(tour);
                                      }}
                                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                      title="Edit tour"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteMyTour(
                                          tour.id,
                                        );
                                      }}
                                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                      title="Delete tour"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Preview of stops */}
                                <div className="flex -space-x-2 overflow-hidden py-1">
                                  {tour.stops
                                    .slice(0, 5)
                                    .map(
                                      (
                                        stop: any,
                                        i: number,
                                      ) => (
                                        <div
                                          key={i}
                                          className="w-8 h-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-100 cursor-pointer hover:ring-[#FF6B35] transition-all"
                                          title={stop.name}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRestaurantClick(
                                              stop,
                                            );
                                          }}
                                        >
                                          <img
                                            src={
                                              stop.image ||
                                              "/placeholder.svg"
                                            }
                                            alt=""
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      ),
                                    )}
                                  {tour.stops.length > 5 && (
                                    <div className="w-8 h-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                                      +{tour.stops.length - 5}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ) : selectedTour ? (
                  // Tour Detail View
                  <div className="p-6">
                    <button
                      onClick={handleBackToResults}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Back</span>
                    </button>

                    <div className="space-y-4">
                      {/* Tour Image */}
                      <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={
                            selectedTour.image ||
                            (Array.isArray(
                              selectedTour.stops,
                            ) &&
                              selectedTour.stops[0]?.image) ||
                            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60"
                          }
                          alt={
                            selectedTour.title ||
                            selectedTour.name
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Tour Info */}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                          {selectedTour.title ||
                            selectedTour.name}
                        </h2>

                        {/* Tour Stats */}
                        <div className="flex items-center gap-4 flex-wrap mb-4">
                          {selectedTour.rating && (
                            <>
                              <div className="flex items-center gap-1">
                                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                <span className="font-bold text-gray-900">
                                  {selectedTour.rating}
                                </span>
                              </div>
                              <span className="text-gray-400">
                                •
                              </span>
                            </>
                          )}
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-5 h-5" />
                            <span>
                              {selectedTour.duration ||
                                `${((Array.isArray(selectedTour.stops) ? selectedTour.stops.length : typeof selectedTour.stops === "number" ? selectedTour.stops : 0) * 1.5).toFixed(1)} hrs`}
                            </span>
                          </div>
                          <span className="text-gray-400">
                            •
                          </span>
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-5 h-5" />
                            <span>
                              {Array.isArray(selectedTour.stops)
                                ? selectedTour.stops.length
                                : typeof selectedTour.stops ===
                                    "number"
                                  ? selectedTour.stops
                                  : 0}{" "}
                              stops
                            </span>
                          </div>
                          {selectedTour.distance && (
                            <>
                              <span className="text-gray-400">
                                •
                              </span>
                              <span className="text-gray-600">
                                {selectedTour.distance}
                              </span>
                            </>
                          )}
                        </div>

                        {selectedTour.description && (
                          <p className="text-gray-600 mb-4">
                            {selectedTour.description}
                          </p>
                        )}

                        {selectedTour.tags &&
                          selectedTour.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {selectedTour.tags.map(
                                (tag: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ),
                              )}
                            </div>
                          )}

                        {/* Action Buttons */}
                        {myTours.find(
                          (t) => t.id === selectedTour.id,
                        ) ? (
                          <div className="flex flex-col gap-3 mb-4">
                            <button
                              onClick={() =>
                                handleEditMyTour(selectedTour)
                              }
                              className="w-full flex items-center justify-center gap-2 bg-[#2E86AB] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#236B8A] transition-colors"
                            >
                              <Edit2 className="w-4 h-4" /> Edit
                              Tour
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                              <Link
                                to={`/tour/${selectedTour.id}`}
                                className="flex items-center justify-center gap-2 border-2 border-[#2E86AB] text-[#2E86AB] px-4 py-3 rounded-lg font-medium hover:bg-[#2E86AB] hover:text-white transition-colors"
                              >
                                View Full Details
                              </Link>
                              <button
                                onClick={() => {
                                  if (
                                    savedTours.find(
                                      (t) =>
                                        t.id ===
                                        selectedTour.id,
                                    )
                                  ) {
                                    // Unsave (Remove from bookmarks only)
                                    setSavedTours(
                                      savedTours.filter(
                                        (t) =>
                                          t.id !==
                                          selectedTour.id,
                                      ),
                                    );
                                    toast.success(
                                      "Removed from saved tours",
                                    );
                                  } else {
                                    // Save (Add to bookmarks)
                                    setSavedTours([
                                      ...savedTours,
                                      selectedTour,
                                    ]);
                                    toast.success(
                                      "Added to saved tours",
                                    );
                                  }
                                }}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                                  savedTours.find(
                                    (t) =>
                                      t.id === selectedTour.id,
                                  )
                                    ? "bg-pink-100 text-pink-600 border border-pink-200 hover:bg-pink-200"
                                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                                }`}
                                title={
                                  savedTours.find(
                                    (t) =>
                                      t.id === selectedTour.id,
                                  )
                                    ? "Remove from saved"
                                    : "Save to bookmarks"
                                }
                              >
                                <Bookmark
                                  className={`w-4 h-4 ${savedTours.find((t) => t.id === selectedTour.id) ? "fill-current" : ""}`}
                                />
                                {savedTours.find(
                                  (t) =>
                                    t.id === selectedTour.id,
                                )
                                  ? "Saved"
                                  : "Save"}
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this tour?",
                                  )
                                ) {
                                  handleDeleteMyTour(
                                    selectedTour.id,
                                  );
                                  setShowMyTours(true);
                                  setSelectedTour(null);
                                }
                              }}
                              className="flex items-center justify-center gap-2 bg-white text-red-600 border border-red-200 px-4 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />{" "}
                              Delete
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 mb-4">
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() =>
                                  loadTour(selectedTour)
                                }
                                className="w-full flex items-center justify-center gap-2 bg-[#2E86AB] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#236B8A] transition-colors col-span-2"
                              >
                                Load into Planner
                              </button>
                              <Link
                                to={`/tour/${selectedTour.id}`}
                                className="flex items-center justify-center gap-2 border-2 border-[#2E86AB] text-[#2E86AB] px-4 py-3 rounded-lg font-medium hover:bg-[#2E86AB] hover:text-white transition-colors"
                              >
                                View Full Details
                              </Link>
                              <button
                                onClick={() => {
                                  if (
                                    savedTours.find(
                                      (t) =>
                                        t.id ===
                                        selectedTour.id,
                                    )
                                  ) {
                                    removeSavedTour(
                                      selectedTour.id,
                                    );
                                  } else {
                                    setSavedTours([
                                      ...savedTours,
                                      selectedTour,
                                    ]);
                                    toast.success(
                                      "Tour saved!",
                                    );
                                  }
                                }}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                                  savedTours.find(
                                    (t) =>
                                      t.id === selectedTour.id,
                                  )
                                    ? "bg-pink-100 text-pink-600 border border-pink-200 hover:bg-pink-200"
                                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                <Bookmark
                                  className={`w-4 h-4 ${savedTours.find((t) => t.id === selectedTour.id) ? "fill-current" : ""}`}
                                />
                                {savedTours.find(
                                  (t) =>
                                    t.id === selectedTour.id,
                                )
                                  ? "Saved"
                                  : "Save"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tour Stops */}
                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4">
                          Stops on this tour
                        </h3>
                        <div className="space-y-3">
                          {getTourRestaurants(selectedTour).map(
                            (restaurant, index) => (
                              <div
                                key={restaurant.id}
                                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-[#FF6B35] transition-colors cursor-pointer"
                                onClick={() =>
                                  handleRestaurantClick(
                                    restaurant,
                                  )
                                }
                              >
                                <div className="flex gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF6B35] text-white font-bold text-sm shrink-0">
                                    {index + 1}
                                  </div>
                                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                    <img
                                      src={
                                        restaurant.image ||
                                        "/placeholder.svg"
                                      }
                                      alt={restaurant.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                                      {restaurant.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span className="text-gray-900 text-sm">
                                          {restaurant.rating}
                                        </span>
                                      </div>
                                      <span className="text-gray-400 text-xs">
                                        •
                                      </span>
                                      <span className="text-gray-600 text-sm">
                                        {restaurant.priceRange}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-1">
                                      {restaurant.address}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      {/* View Full Details Link - Only for public tours */}
                      {!myTours.find(
                        (t) => t.id === selectedTour.id,
                      ) && <div className="hidden"></div>}
                    </div>
                  </div>
                ) : selectedDish ? (
                  // Dish Detail View
                  <div className="p-6">
                    <button
                      onClick={handleBackToResults}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Back to Dishes</span>
                    </button>

                    <div className="space-y-6">
                      {/* Dish Hero */}
                      <div className="w-full h-56 rounded-xl overflow-hidden bg-gray-100 relative">
                        <img
                          src={selectedDish.image}
                          alt={selectedDish.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h2 className="text-3xl font-bold mb-1">
                            {selectedDish.name}
                          </h2>
                          <p className="opacity-90 font-medium">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(selectedDish.minPrice)}
                            {selectedDish.minPrice !==
                              selectedDish.maxPrice &&
                              ` - ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedDish.maxPrice)}`}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">
                          About this dish
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm mb-3">
                          {selectedDish.description} A flavorful
                          choice popular among locals and
                          visitors alike.
                        </p>

                        {/* Tags/Cuisine Info */}
                        <div className="flex flex-wrap gap-2">
                          {selectedDish.tags &&
                            selectedDish.tags.map(
                              (tag: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200"
                                >
                                  {tag}
                                </span>
                              ),
                            )}
                        </div>
                      </div>

                      {/* Places Serving This */}
                      <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Utensils className="w-4 h-4" />
                          Available at{" "}
                          {selectedDish.restaurants.length}{" "}
                          places
                        </h3>

                        <div className="space-y-3">
                          {selectedDish.restaurants.map(
                            (restaurant: Restaurant) => {
                              // Find the specific dish details (price) for THIS restaurant
                              const specificDish =
                                restaurant.dishes.find(
                                  (d) =>
                                    d.name.trim() ===
                                    selectedDish.name,
                                );

                              return (
                                <div
                                  key={restaurant.id}
                                  className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-[#FF6B35] transition-colors cursor-pointer"
                                  onClick={() => {
                                    setSelectedDish(null);
                                    setPreviousView(
                                      "dish-search",
                                    );
                                    setSelectedRestaurant(
                                      restaurant,
                                    );
                                  }}
                                >
                                  <div className="flex gap-3">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                      <img
                                        src={restaurant.image}
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-800 text-sm truncate">
                                          {restaurant.name}
                                        </h4>

                                        {/* PRICE DISPLAY BLOCK */}
                                        <div className="flex flex-col items-end gap-1">
                                          {specificDish && (
                                            <span className="text-sm font-bold text-emerald-600">
                                              {
                                                specificDish.price
                                              }{" "}
                                              ₫
                                            </span>
                                          )}
                                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                            Open
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1 text-xs text-yellow-500 my-1">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span className="text-gray-700 font-medium">
                                          {restaurant.rating}
                                        </span>
                                        <span className="text-gray-400">
                                          (
                                          {
                                            restaurant.reviewCount
                                          }
                                          )
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">
                                          {restaurant.address}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedRestaurant ? (
                  // Restaurant Detail View
                  <div className="p-6">
                    <button
                      onClick={handleBackToResults}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Back</span>
                    </button>

                    <div className="space-y-4">
                      {/* Restaurant Image */}
                      <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={
                            selectedRestaurant.image ||
                            "/placeholder.svg"
                          }
                          alt={selectedRestaurant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Restaurant Info */}
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {selectedRestaurant.name}
                        </h2>
                        <button
                          onClick={() =>
                            toggleRestaurantSelection(
                              selectedRestaurant,
                            )
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
                            tourStops.find(
                              (s) =>
                                s.id === selectedRestaurant.id,
                            )
                              ? "bg-[#2E86AB] text-white"
                              : "bg-[#FF6B35] text-white hover:bg-[#e55a2b]"
                          }`}
                        >
                          {tourStops.find(
                            (s) =>
                              s.id === selectedRestaurant.id,
                          )
                            ? "✓ Added"
                            : "+ Add"}
                        </button>
                      </div>

                      {/* Rating & Info */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                          <span className="font-bold text-gray-900">
                            {selectedRestaurant.rating}
                          </span>
                          <span className="text-gray-500">
                            ({selectedRestaurant.reviewCount})
                          </span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="font-medium text-gray-700">
                          {selectedRestaurant.priceRange}
                        </span>
                        {selectedRestaurant.openNow && (
                          <>
                            <span className="text-gray-400">
                              •
                            </span>
                            <span className="font-medium text-green-600">
                              Open now
                            </span>
                          </>
                        )}
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>
                          {selectedRestaurant.address}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {selectedRestaurant.tags.map(
                          (tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                            >
                              {tag}
                            </span>
                          ),
                        )}
                      </div>

                      {/* Description */}
                      {selectedRestaurant.description && (
                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="font-bold text-gray-900 mb-2">
                            About
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {selectedRestaurant.description}
                          </p>
                        </div>
                      )}

                      {/* Amenities */}
                      {selectedRestaurant.amenities &&
                        selectedRestaurant.amenities.length >
                          0 && (
                          <div className="pt-4 border-t border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-3">
                              Amenities
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                              {selectedRestaurant.amenities.map(
                                (amenity, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 text-sm text-gray-600"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]"></div>
                                    {amenity}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Menu Preview */}
                      {selectedRestaurant.dishes &&
                        selectedRestaurant.dishes.length >
                          0 && (
                          <div className="pt-4 border-t border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-3">
                              Menu Highlights
                            </h3>
                            <div className="space-y-3">
                              {selectedRestaurant.dishes.map(
                                (dish) => (
                                  <div
                                    key={dish.id}
                                    className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg -mx-1.5 transition-colors"
                                    onClick={() => {
                                      // 1. Aggregate data for this dish across ALL restaurants
                                      // (We need to know who else serves it to populate the Dish Detail view)
                                      const dishName =
                                        dish.name.trim();
                                      const rawPrice =
                                        parseInt(
                                          dish.price.replace(
                                            /,/g,
                                            "",
                                          ),
                                          10,
                                        ) || 0;

                                      const aggregatedDish = {
                                        name: dishName,
                                        image: dish.image,
                                        description:
                                          "A popular choice among locals.", // Default description
                                        minPrice: rawPrice,
                                        maxPrice: rawPrice,
                                        restaurants:
                                          [] as Restaurant[],
                                        tags: new Set<string>(),
                                      };

                                      // Scan all restaurants to find this dish
                                      MOCK_RESTAURANTS.forEach(
                                        (repo) => {
                                          const found =
                                            repo.dishes.find(
                                              (d) =>
                                                d.name.trim() ===
                                                dishName,
                                            );
                                          if (found) {
                                            // Update Price Range
                                            const foundPrice =
                                              parseInt(
                                                found.price.replace(
                                                  /,/g,
                                                  "",
                                                ),
                                                10,
                                              ) || 0;
                                            if (
                                              foundPrice <
                                              aggregatedDish.minPrice
                                            )
                                              aggregatedDish.minPrice =
                                                foundPrice;
                                            if (
                                              foundPrice >
                                              aggregatedDish.maxPrice
                                            )
                                              aggregatedDish.maxPrice =
                                                foundPrice;

                                            // Collect Tags
                                            if (found.tags)
                                              found.tags.forEach(
                                                (t) =>
                                                  aggregatedDish.tags.add(
                                                    t,
                                                  ),
                                              );

                                            // Add Restaurant
                                            aggregatedDish.restaurants.push(
                                              repo,
                                            );
                                          }
                                        },
                                      );

                                      // 2. Navigate
                                      setPreviousRestaurant(
                                        selectedRestaurant,
                                      ); // Save current restaurant for "Back" button
                                      setPreviousView(
                                        "restaurant-detail",
                                      ); // Set history state
                                      setSelectedRestaurant(
                                        null,
                                      ); // Close restaurant view
                                      setSelectedDish({
                                        // Open dish view
                                        ...aggregatedDish,
                                        tags: Array.from(
                                          aggregatedDish.tags,
                                        ),
                                      });
                                    }}
                                  >
                                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                                      <img
                                        src={dish.image}
                                        alt={dish.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-[#FF6B35] transition-colors">
                                        {dish.name}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <span className="text-emerald-600 text-xs font-bold">
                                          {dish.price} ₫
                                        </span>
                                        {dish.isSignature && (
                                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
                                            Signature
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* View Full Details Link */}
                      <Link
                        to={`/restaurant/${selectedRestaurant.id}`}
                        className="block w-full text-center px-4 py-3 border-2 border-[#FF6B35] text-[#FF6B35] rounded-lg font-medium hover:bg-[#FF6B35] hover:text-white transition-colors"
                      >
                        View Full Details
                      </Link>
                    </div>
                  </div>
                ) : showMiniItinerary ? (
                  // Mini Itinerary View
                  <div className="p-4">
                    <button
                      onClick={() =>
                        setShowMiniItinerary(false)
                      }
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Back</span>
                    </button>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Current Itinerary
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> ~
                        {tourStops.length * 1.5}h
                      </span>
                      <span className="flex items-center gap-1">
                        <Map className="w-4 h-4" />{" "}
                        {tourStops.length} stops
                      </span>
                    </div>

                    {tourStops.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>Your itinerary is empty.</p>
                        <button
                          onClick={() =>
                            setShowMiniItinerary(false)
                          }
                          className="mt-4 text-[#FF6B35] font-medium hover:underline"
                        >
                          Add restaurants
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 mb-6">
                        {tourStops.map((stop, index) => (
                          <div
                            key={stop.id}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                          >
                            <div className="w-6 h-6 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {stop.name}
                              </h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setShowMiniItinerary(false);
                        setShowItinerary(true);
                      }}
                      className="w-full bg-[#2E86AB] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#236B8A] transition-colors flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-4 h-4" /> Go to Full
                      Itinerary
                    </button>
                  </div>
                ) : showItinerary ? (
                  // Itinerary View (Check for empty)
                  tourStops.length === 0 ? (
                    // Empty Itinerary State
                    <div className="h-full flex flex-col bg-gray-50">
                      <div className="p-4">
                        <button
                          onClick={() => {
                            setShowItinerary(false);
                            setShowTourMenu(true);
                            setShowSaved(false);
                            setShowMyTours(false);
                            setSelectedTour(null);
                            setSelectedRestaurant(null);
                          }}
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          <span>Back</span>
                        </button>
                      </div>
                      <div className="flex-1 flex flex-col p-8 text-center items-center justify-center -mt-12">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                          <MapPin className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Your Itinerary is Empty
                        </h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                          Start exploring restaurants on the map
                          or list and add them to build your
                          tour!
                        </p>
                        <button
                          onClick={() => {
                            setShowItinerary(false);
                            // Just close itinerary to show search results
                          }}
                          className="px-6 py-3 bg-[#FF6B35] text-white font-medium rounded-lg hover:bg-[#e55a2b] transition-colors shadow-lg shadow-orange-200"
                        >
                          Find Restaurants
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Active Itinerary List
                    <div className="p-4 bg-gray-50 h-full flex flex-col">
                      <div className="mb-4">
                        <button
                          onClick={() => {
                            setShowItinerary(false);
                            setShowTourMenu(true);
                            setShowSaved(false);
                            setShowMyTours(false);
                            setSelectedTour(null);
                            setSelectedRestaurant(null);
                          }}
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          <span>Back</span>
                        </button>

                        {isEditingName ? (
                          <div className="space-y-3 bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={tempName}
                                onChange={(e) =>
                                  setTempName(e.target.value)
                                }
                                placeholder="Tour Name"
                                className="flex-1 px-3 py-2 border border-[#FF6B35] rounded-lg font-medium text-slate-800 outline-none"
                                autoFocus
                              />
                            </div>
                            <textarea
                              value={tourDescription}
                              onChange={(e) =>
                                setTourDescription(
                                  e.target.value,
                                )
                              }
                              placeholder="Add a description for your tour..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#FF6B35]"
                              rows={3}
                            />
                            <div>
                              <p className="text-xs text-gray-500 mb-2">
                                Select Tags:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {availableTags.map((tag) => (
                                  <button
                                    key={tag}
                                    onClick={() => {
                                      if (
                                        tourTags.includes(tag)
                                      ) {
                                        setTourTags(
                                          tourTags.filter(
                                            (t) => t !== tag,
                                          ),
                                        );
                                      } else {
                                        setTourTags([
                                          ...tourTags,
                                          tag,
                                        ]);
                                      }
                                    }}
                                    className={`text-xs px-2 py-1 rounded-full transition-colors ${
                                      tourTags.includes(tag)
                                        ? "bg-[#FF6B35] text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                onClick={handleNameCancel}
                                className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleNameSave}
                                className="px-3 py-1 bg-[#FF6B35] text-white rounded-lg text-sm hover:bg-[#e55a2b]"
                              >
                                Save Details
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start gap-2 group mb-2">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-800">
                                  {tourName}
                                </h3>
                                {tourDescription && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {tourDescription}
                                  </p>
                                )}
                                {tourTags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {tourTags.map((tag, i) => (
                                      <span
                                        key={i}
                                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setIsEditingName(true);
                                  setTempName(
                                    tourName || "Untitled Tour",
                                  );
                                }}
                                className="p-2 text-gray-400 hover:text-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Description Input */}
                        <div className="mt-2">
                          <textarea
                            value={tourDescription}
                            onChange={(e) =>
                              setTourDescription(e.target.value)
                            }
                            placeholder="Add a description for your tour..."
                            className="w-full px-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:border-[#FF6B35] outline-none resize-none"
                            rows={2}
                          />
                        </div>

                        {/* Tags Selection */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {availableTags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => {
                                if (tourTags.includes(tag)) {
                                  setTourTags(
                                    tourTags.filter(
                                      (t) => t !== tag,
                                    ),
                                  );
                                } else {
                                  setTourTags([
                                    ...tourTags,
                                    tag,
                                  ]);
                                }
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                tourTags.includes(tag)
                                  ? "bg-[#FF6B35] text-white"
                                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#FF6B35]"
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-4 text-sm text-gray-500 mt-3 pb-3 border-b border-gray-200">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> ~
                            {tourStops.length * 1.5}h
                          </span>
                          <span className="flex items-center gap-1">
                            <Map className="w-4 h-4" />{" "}
                            {tourStops.length} stops
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        {tourStops.map((stop, index) => (
                          <div
                            key={stop.id}
                            className="relative flex items-start gap-3"
                          >
                            <div className="mt-5 w-2.5 h-2.5 rounded-full bg-[#FF6B35] ring-4 ring-white shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                                Stop {index + 1}
                              </span>
                              <DraggableStop
                                stop={stop}
                                index={index}
                                moveStop={moveStop}
                                removeStop={removeStop}
                                onStopClick={
                                  handleRestaurantClick
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="sticky bottom-[70px] bg-gray-50 pt-2 pb-2">
                        <button
                          onClick={() =>
                            setShowItinerary(false)
                          }
                          className="w-full py-3 bg-white border-2 border-[#FF6B35] text-[#FF6B35] rounded-lg font-medium hover:bg-[#FF6B35] hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Search className="w-4 h-4" /> Add
                          More Restaurants
                        </button>
                      </div>

                      <div className="flex gap-2 sticky bottom-0 bg-gray-50 pt-2 pb-4">
                        <button
                          onClick={optimizeRoute}
                          className="flex-1 flex items-center justify-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 py-3 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />{" "}
                          Optimize Route
                        </button>
                        <button
                          onClick={handleSaveTour}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B35] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#e55a2b] transition-colors shadow-lg shadow-orange-200"
                        >
                          <Save className="w-4 h-4" />{" "}
                          {editingTourId
                            ? "Update Tour"
                            : "Save Tour"}
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  // Default Empty/Fallback State
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                    {/* This only shows if everything is false, which shouldn't happen with proper state management */}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Map */}
        <div className="hidden lg:block flex-1 relative bg-gray-100">
          {/* Map Background - Same as old Search page */}
          <div className="absolute inset-0 bg-[#E5F0F2]">
            {/* Fake map grid/streets */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(#2E86AB 1px, transparent 1px), linear-gradient(#f0f0f0 2px, transparent 2px), linear-gradient(90deg, #f0f0f0 2px, transparent 2px)",
                backgroundSize:
                  "20px 20px, 100px 100px, 100px 100px",
              }}
            />

            {/* Fake River */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-[#a3d5e6] opacity-50 transform skew-x-12 translate-x-20" />

            {/* Map Pins - Clickable Dots */}
            <svg className="absolute inset-0 w-full h-full">
              {filteredRestaurants.map((restaurant, idx) => {
                const isInItinerary = tourStops.find(
                  (s) => s.id === restaurant.id,
                );
                const isCurrentlySelected =
                  selectedRestaurant?.id === restaurant.id;
                // Check if this restaurant is part of the currently viewed tour
                const isInViewedTour = selectedTour
                  ? getTourRestaurants(selectedTour).find(
                      (r) => r.id === restaurant.id,
                    )
                  : false;
                // Use restaurant's lat/lng for positioning
                const x = restaurant.lat;
                const y = restaurant.lng;

                return (
                  <g
                    key={restaurant.id}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() =>
                      handleMapDotClick(restaurant)
                    }
                  >
                    {/* Highlight ring for tour stops */}
                    {isInViewedTour && (
                      <circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="32"
                        fill="none"
                        stroke="#FCD34D"
                        strokeWidth="3"
                        className="animate-pulse"
                      />
                    )}
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="24"
                      fill={
                        isInItinerary ? "#2E86AB" : "#FF6B35"
                      }
                      className="drop-shadow-lg"
                    />
                    <text
                      x={`${x}%`}
                      y={`${y}%`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      className="text-xs font-bold pointer-events-none select-none"
                    >
                      {restaurant.priceRange}
                    </text>

                    {/* Tooltip on hover */}
                    <title>{restaurant.name}</title>
                  </g>
                );
              })}

              {/* Draw path between selected stops */}
              {tourStops.length > 1 && (
                <polyline
                  points={tourStops
                    .map((s) => `${s.lat},${s.lng}`)
                    .join(" ")}
                  fill="none"
                  stroke="#2E86AB"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  className="pointer-events-none"
                />
              )}
            </svg>

            {/* Pin marker for selected restaurant */}
            {selectedRestaurant && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${selectedRestaurant.lat}%`,
                  top: `calc(${selectedRestaurant.lng}% - 50px)`,
                  transform: "translateX(-50%)",
                }}
              >
                <MapPin
                  className="w-10 h-10 text-red-500 fill-red-500 animate-bounce drop-shadow-lg"
                  strokeWidth={1.5}
                />
              </div>
            )}
          </div>

          {/* Show Your Location - Small button at bottom right */}
          <div className="absolute bottom-8 right-8 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white ring-2 ring-blue-200" />
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="bg-white rounded-lg shadow-lg p-2">
              <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
                <Navigation className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Legend
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#FF6B35]"></div>
                <span className="text-sm text-gray-700">
                  Available
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#2E86AB]"></div>
                <span className="text-sm text-gray-700">
                  In Itinerary
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Click dots to view details
              </p>
            </div>
          </div>

          {/* Tour Summary Overlay */}
          {tourStops.length > 0 && (
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">
                  {tourName}
                </h3>
                <span className="text-xs bg-[#2E86AB] text-white px-2 py-1 rounded-full">
                  {tourStops.length} stops
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Est. {(tourStops.length * 1.5).toFixed(1)} hours
                • {(tourStops.length * 2).toFixed(1)}km
              </p>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};
