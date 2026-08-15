import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';
import { Restaurant } from '../lib/data';

interface RestaurantContextType {
  restaurants: Restaurant[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/restaurants');
      // Normalize backend data to match Frontend interface
      const normalized: Restaurant[] = (res.data || []).map((r: any) => ({
        ...r,
        id: String(r.id ?? r._id),
        reviewCount: r.reviewCount ?? 0,
        priceRange: r.priceRange ?? '$$',
        image: r.image ?? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        tags: r.tags ?? [],
        openNow: r.openNow ?? isOpenNow(r.openingTime, r.closingTime),
        description: r.description ?? '',
        dishes: (r.dishes ?? []).map((d: any) => ({
          ...d,
          id: String(d.id ?? d._id ?? ''),
          isSignature: d.isSignature ?? false,
        })),
        reviews: r.reviews ?? [],
        amenities: r.amenities ?? [],
      }));
      setRestaurants(normalized);
    } catch (err: any) {
      console.error('Lỗi khi fetch restaurants:', err);
      setError(err.message || 'Không thể tải dữ liệu nhà hàng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <RestaurantContext.Provider value={{ restaurants, isLoading, error, refetch: fetchRestaurants }}>
      {children}
    </RestaurantContext.Provider>
  );
};

// Helper: check if restaurant is open now based on opening/closing time
function isOpenNow(openingTime?: string, closingTime?: string): boolean {
  if (!openingTime || !closingTime) return true; // Default open if no time set
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = openingTime.split(':').map(Number);
  const [closeH, closeM] = closingTime.split(':').map(Number);
  const openMinutes = openH * 60 + (openM || 0);
  const closeMinutes = closeH * 60 + (closeM || 0);

  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }
  // Handle overnight hours (e.g., 22:00 - 06:00)
  return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
}

export const useRestaurants = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurants must be used within a RestaurantProvider');
  }
  return context;
};
