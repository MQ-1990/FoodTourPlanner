export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string[];
  district: string;
  rating: number;
  reviews: number;
  isOpen: boolean;
  address: string;
  lat: number;
  lng: number;
  priceRange: string;
}

export interface Tour {
  id: string;
  title: string;
  image: string;
  duration: string;
  distance: string;
  stops: number;
  rating: number;
  createdBy?: string;
  isPublic?: boolean;
  restaurants?: Restaurant[];
}

export const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Phở Hòa Pasteur",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
    cuisine: ["Vietnamese", "Phở"],
    district: "Quận 3",
    rating: 4.8,
    reviews: 1240,
    isOpen: true,
    address: "260C Pasteur, District 3, HCMC",
    lat: 40,
    lng: 30,
    priceRange: "$$"
  },
  {
    id: "2",
    name: "Bánh Mì Huỳnh Hoa",
    image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80",
    cuisine: ["Vietnamese", "Bánh Mì"],
    district: "Quận 1",
    rating: 4.6,
    reviews: 3500,
    isOpen: true,
    address: "26 Le Thi Rieng, District 1, HCMC",
    lat: 55,
    lng: 45,
    priceRange: "$"
  },
  {
    id: "3",
    name: "The Deck Saigon",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
    cuisine: ["Fine Dining", "Fusion"],
    district: "Quận 2",
    rating: 4.7,
    reviews: 890,
    isOpen: false,
    address: "38 Nguyen U Di, District 2, HCMC",
    lat: 70,
    lng: 20,
    priceRange: "$$$$"
  },
  {
    id: "4",
    name: "Pizza 4P's Ben Thanh",
    image: "https://images.unsplash.com/photo-1574129645730-0968ac20c512?auto=format&fit=crop&w=800&q=80",
    cuisine: ["Italian", "Pizza"],
    district: "Quận 1",
    rating: 4.9,
    reviews: 2100,
    isOpen: true,
    address: "8 Thu Khoa Huan, District 1, HCMC",
    lat: 48,
    lng: 42,
    priceRange: "$$$"
  },
  {
    id: "5",
    name: "Cục Gạch Quán",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
    cuisine: ["Vietnamese", "Traditional"],
    district: "Quận 1",
    rating: 4.4,
    reviews: 500,
    isOpen: true,
    address: "10 Dang Tat, District 1, HCMC",
    lat: 30,
    lng: 60,
    priceRange: "$$"
  },
  {
    id: "6",
    name: "Secret Garden",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    cuisine: ["Vietnamese", "Rooftop"],
    district: "Quận 1",
    rating: 4.5,
    reviews: 600,
    isOpen: true,
    address: "158 Pasteur, District 1, HCMC",
    lat: 42,
    lng: 35,
    priceRange: "$$"
  }
];

export const tours: Tour[] = [
  {
    id: "t1",
    title: "Saigon Street Food Adventure",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    duration: "3 giờ",
    distance: "4.5 km",
    stops: 5,
    rating: 4.9,
    isPublic: true,
    createdBy: "user1"
  },
  {
    id: "t2",
    title: "Hidden Coffee Gems",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80",
    duration: "2 giờ",
    distance: "2.0 km",
    stops: 3,
    rating: 4.7,
    isPublic: true,
    createdBy: "user1"
  },
  {
    id: "t3",
    title: "Vegetarian Delights",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    duration: "2.5 giờ",
    distance: "3.2 km",
    stops: 4,
    rating: 4.5,
    isPublic: true,
    createdBy: "user1"
  }
];
