export interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  image?: string;
}

export interface Dish {
  id: string;
  name: string;
  price: string;
  image: string;
  isSignature: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  address: string;
  tags: string[];
  image: string;
  lat: number; // percent X for mock map
  lng: number; // percent Y for mock map
  openNow: boolean;
  description: string;
  dishes: Dish[];
  reviews: Review[];
  amenities: string[];
}

export interface Tour {
  id: string;
  title: string;
  image: string;
  duration: string;
  distance: string;
  stops: number;
  rating: number;
}

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "Phở Hòa Pasteur",
    rating: 4.8,
    reviewCount: 1240,
    priceRange: "$$",
    address: "260C Pasteur, District 3, HCMC",
    tags: ["Vietnamese", "Phở", "Breakfast"],
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
    lat: 40,
    lng: 30,
    openNow: true,
    description: "Famous pho spot serving traditional southern style pho with generous portions of meat and fresh herbs.",
    amenities: ["Wifi", "Air Conditioning", "Parking"],
    dishes: [
      { id: "d1", name: "Phở Đặc Biệt", price: "$4.50", image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80", isSignature: true },
      { id: "d2", name: "Spring Rolls", price: "$2.00", image: "https://images.unsplash.com/photo-1548029960-695d127f4543?auto=format&fit=crop&w=400&q=80", isSignature: false },
    ],
    reviews: [
      { id: "r1", user: "Sarah Jenkins", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d", rating: 5, date: "2 days ago", text: "Best Pho in town! The broth is incredibly rich." },
    ]
  },
  {
    id: "2",
    name: "Bánh Mì Huỳnh Hoa",
    rating: 4.6,
    reviewCount: 3500,
    priceRange: "$",
    address: "26 Le Thi Rieng, District 1, HCMC",
    tags: ["Bánh Mì", "Street Food", "Quick Bite"],
    image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80",
    lat: 55,
    lng: 45,
    openNow: true,
    description: "The most famous Bánh Mì in Saigon. Known for being packed with meat and pâté.",
    amenities: ["Takeout Only"],
    dishes: [
      { id: "d3", name: "Bánh Mì Đặc Biệt", price: "$2.50", image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=400&q=80", isSignature: true },
    ],
    reviews: []
  },
  {
    id: "3",
    name: "The Deck Saigon",
    rating: 4.7,
    reviewCount: 890,
    priceRange: "$$$$",
    address: "38 Nguyen U Di, District 2, HCMC",
    tags: ["Fine Dining", "River View", "Fusion"],
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
    lat: 70,
    lng: 20,
    openNow: false,
    description: "Elegant riverside dining with a stunning sunset view and asian-fusion cuisine.",
    amenities: ["Wifi", "Valet Parking", "Bar"],
    dishes: [],
    reviews: []
  },
  {
    id: "4",
    name: "Secret Garden",
    rating: 4.5,
    reviewCount: 600,
    priceRange: "$$",
    address: "158 Pasteur, District 1, HCMC",
    tags: ["Vietnamese", "Rooftop", "Cozy"],
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    lat: 42,
    lng: 35,
    openNow: true,
    description: "Authentic home-cooked style Vietnamese food served on a charming rooftop lantern-lit terrace.",
    amenities: ["Wifi", "Rooftop"],
    dishes: [],
    reviews: []
  },
  {
    id: "5",
    name: "Pizza 4P's Ben Thanh",
    rating: 4.9,
    reviewCount: 2100,
    priceRange: "$$$",
    address: "8 Thu Khoa Huan, District 1, HCMC",
    tags: ["Italian", "Pizza", "Cheese"],
    image: "https://images.unsplash.com/photo-1574129645730-0968ac20c512?auto=format&fit=crop&w=800&q=80",
    lat: 48,
    lng: 42,
    openNow: true,
    description: "Japanese-Italian fusion pizza famous for their house-made cheeses.",
    amenities: ["Wifi", "AC", "Reservations Recommended"],
    dishes: [],
    reviews: []
  },
  {
    id: "6",
    name: "Cục Gạch Quán",
    rating: 4.4,
    reviewCount: 500,
    priceRange: "$$",
    address: "10 Dang Tat, District 1, HCMC",
    tags: ["Vietnamese", "Vintage", "Family"],
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
    lat: 30,
    lng: 60,
    openNow: true,
    description: "A rustic villa serving traditional Vietnamese countryside dishes.",
    amenities: ["Wifi", "Garden"],
    dishes: [],
    reviews: []
  }
];

export const MOCK_TOURS: Tour[] = [
  {
    id: "t1",
    title: "Saigon Street Food Adventure",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    duration: "3 hours",
    distance: "4.5 km",
    stops: 5,
    rating: 4.9
  },
  {
    id: "t2",
    title: "Hidden Coffee Gems",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80",
    duration: "2 hours",
    distance: "2.0 km",
    stops: 3,
    rating: 4.7
  },
  {
    id: "t3",
    title: "Vegetarian Delights",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    duration: "2.5 hours",
    distance: "3.2 km",
    stops: 4,
    rating: 4.5
  },
];
