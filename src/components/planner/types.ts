// Shared types for Planner sub-components
import { Restaurant } from '../lib/data';

export type PreviousViewType =
  | 'search-menu'
  | 'restaurant-search'
  | 'tour-search'
  | 'dish-search'
  | 'favorites'
  | 'tours'
  | 'saved-menu'
  | 'tour-detail'
  | 'my-tours'
  | 'current-itinerary'
  | 'tour-menu'
  | 'restaurant-detail';

export interface PlannerState {
  // Tour builder
  tourStops: Restaurant[];
  setTourStops: React.Dispatch<React.SetStateAction<Restaurant[]>>;
  tourName: string;
  setTourName: React.Dispatch<React.SetStateAction<string>>;
  tourDescription: string;
  setTourDescription: React.Dispatch<React.SetStateAction<string>>;
  tourTags: string[];
  setTourTags: React.Dispatch<React.SetStateAction<string[]>>;
  isEditingName: boolean;
  setIsEditingName: React.Dispatch<React.SetStateAction<boolean>>;
  editingTourId: string | null;
  setEditingTourId: React.Dispatch<React.SetStateAction<string | null>>;
  tempName: string;
  setTempName: React.Dispatch<React.SetStateAction<string>>;

  // Views
  showItinerary: boolean;
  setShowItinerary: React.Dispatch<React.SetStateAction<boolean>>;
  showMiniItinerary: boolean;
  setShowMiniItinerary: React.Dispatch<React.SetStateAction<boolean>>;
  showTourMenu: boolean;
  setShowTourMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showSearchMenu: boolean;
  setShowSearchMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showRestaurantSearch: boolean;
  setShowRestaurantSearch: React.Dispatch<React.SetStateAction<boolean>>;
  showTourSearch: boolean;
  setShowTourSearch: React.Dispatch<React.SetStateAction<boolean>>;
  showDishSearch: boolean;
  setShowDishSearch: React.Dispatch<React.SetStateAction<boolean>>;
  showSaved: boolean;
  setShowSaved: React.Dispatch<React.SetStateAction<boolean>>;
  showMyTours: boolean;
  setShowMyTours: React.Dispatch<React.SetStateAction<boolean>>;
  isPanelCollapsed: boolean;
  setIsPanelCollapsed: React.Dispatch<React.SetStateAction<boolean>>;

  // Selections
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: React.Dispatch<React.SetStateAction<Restaurant | null>>;
  previousRestaurant: Restaurant | null;
  setPreviousRestaurant: React.Dispatch<React.SetStateAction<Restaurant | null>>;
  selectedTour: any | null;
  setSelectedTour: React.Dispatch<React.SetStateAction<any | null>>;
  previousTour: any | null;
  setPreviousTour: React.Dispatch<React.SetStateAction<any | null>>;
  selectedDish: any | null;
  setSelectedDish: React.Dispatch<React.SetStateAction<any | null>>;

  // Saved data
  savedCategory: 'favorites' | 'tours' | null;
  setSavedCategory: React.Dispatch<React.SetStateAction<'favorites' | 'tours' | null>>;
  favoriteRestaurants: Restaurant[];
  setFavoriteRestaurants: React.Dispatch<React.SetStateAction<Restaurant[]>>;
  savedTours: any[];
  setSavedTours: React.Dispatch<React.SetStateAction<any[]>>;
  myTours: any[];
  setMyTours: React.Dispatch<React.SetStateAction<any[]>>;

  // Navigation
  previousView: PreviousViewType;
  setPreviousView: React.Dispatch<React.SetStateAction<PreviousViewType>>;

  // Restaurant filters
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPrice: string;
  setSelectedPrice: React.Dispatch<React.SetStateAction<string>>;
  minRating: number;
  setMinRating: React.Dispatch<React.SetStateAction<number>>;

  // Tour filters
  tourSearchQuery: string;
  setTourSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  showTourFilters: boolean;
  setShowTourFilters: React.Dispatch<React.SetStateAction<boolean>>;
  tourMinRating: number;
  setTourMinRating: React.Dispatch<React.SetStateAction<number>>;
  tourDurationFilter: string;
  setTourDurationFilter: React.Dispatch<React.SetStateAction<string>>;

  // Dish filters
  dishSearchQuery: string;
  setDishSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  showDishFilters: boolean;
  setShowDishFilters: React.Dispatch<React.SetStateAction<boolean>>;
  dishCuisine: string;
  setDishCuisine: React.Dispatch<React.SetStateAction<string>>;
  dishPreference: string;
  setDishPreference: React.Dispatch<React.SetStateAction<string>>;
  dishBudget: string;
  setDishBudget: React.Dispatch<React.SetStateAction<string>>;
  dishLocation: string;
  setDishLocation: React.Dispatch<React.SetStateAction<string>>;
  dishDistance: string;
  setDishDistance: React.Dispatch<React.SetStateAction<string>>;

  // Computed / callbacks
  filteredRestaurants: Restaurant[];
  filteredTours: any[];
  filteredDishes: any[];
  handleRestaurantClick: (restaurant: Restaurant) => void;
  handleTourClick: (tour: any) => void;
  handleBackToResults: () => void;
  handleToggleItinerary: () => void;
  toggleRestaurantSelection: (restaurant: Restaurant) => void;
  moveStop: (dragIndex: number, hoverIndex: number) => void;
  syncStopOrder: () => void;
  removeStop: (id: string) => void;
  optimizeRoute: () => void;
  handleSaveTour: () => void;
  handleDeleteMyTour: (id: string) => void;
  handleEditMyTour: (tour: any) => void;
  handleNameSave: () => void;
  handleNameCancel: () => void;
  clearFilters: () => void;
  clearTourFilters: () => void;
  clearDishFilters: () => void;
  loadTour: (tour: any) => void;
  getTourRestaurants: (tour: any) => Restaurant[];
  removeFavorite: (id: string) => void;
  removeSavedTour: (id: string) => void;
}

// Constants
export const AVAILABLE_TAGS = [
  'Foodie', 'Nightlife', 'Cultural', 'Family Friendly',
  'Budget', 'Luxury', 'Adventure', 'Coffee',
];

export const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];

export const DISH_CUISINES = ['Vietnamese', 'Street Food', 'Drinks', 'Seafood', 'Hotpot & BBQ'];

export const DISH_PREFERENCES = [
  'Món cay', 'Món ngọt', 'Hải sản', 'Cà phê', 'Trà sữa', 'Chay', 'Đồ nướng', 'Phở', 'Bún',
];

export const DISH_BUDGETS = [
  '< 50,000đ', '50,000 - 100,000đ', '100,000 - 300,000đ', '300,000 - 500,000đ', '> 500,000đ',
];

export const DISH_DISTANCES = ['1', '3', '5', '10', '20'];

export const DISTRICTS = ['District 1', 'District 2', 'District 3', 'District 4'];
