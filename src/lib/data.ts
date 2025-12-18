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
  price: string; // Format: "100,000"
  image: string;
  isSignature: boolean;
  tags?: string[]; // Added for filtering
  description?: string; // Added for detail view
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  address: string;
  tags: string[]; // Matches filter options
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
  tags?: string[];
  description?: string;
}

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "Phở Hòa Pasteur",
    rating: 4.8,
    reviewCount: 1240,
    priceRange: "$$",
    address: "260C Pasteur, District 3, HCMC",
    tags: ["Vietnamese", "Phở", "Món nước", "Breakfast"],
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
    lat: 40,
    lng: 30,
    openNow: true,
    description:
      "A culinary landmark in District 3, Phở Hòa has been serving its signature clear, slightly sweet Southern-style broth for generations. It is a favorite among locals for its generous portions and extensive platter of fresh herbs.",
    amenities: ["Wifi", "Air Conditioning", "Parking"],
    dishes: [
      {
        id: "d1",
        name: "Phở Bò Đặc Biệt",
        price: "90,000",
        image:
          "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80",
        isSignature: true,
        tags: ["Phở", "Vietnamese", "Món nước"],
        description:
          "The house special featuring a rich, aromatic beef bone broth simmered for 12 hours, topped with tender sliced beef, brisket, and meatballs.",
      },
      {
        id: "d2",
        name: "Gỏi Cuốn",
        price: "35,000",
        image:
          "https://images.unsplash.com/photo-1548029960-695d127f4543?auto=format&fit=crop&w=400&q=80",
        isSignature: false,
        tags: ["Appetizer", "Món ăn kèm", "Vietnamese"],
        description:
          "Fresh spring rolls packed with shrimp, pork, vermicelli, and herbs, served with a savory peanut dipping sauce.",
      },
      {
        id: "d_coffee",
        name: "Cà phê sữa đá",
        price: "35,000",
        image:
          "https://images.unsplash.com/photo-1517701604599-bb29b5c7dd90?auto=format&fit=crop&w=400&q=80",
        isSignature: false,
        tags: ["Drinks", "Cà phê", "Món ngọt"],
        description:
          "Traditional Vietnamese iced coffee with condensed milk, robust and sweet.",
      },
    ],
    reviews: [
      {
        id: "r1",
        user: "Sarah Jenkins",
        avatar:
          "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        rating: 5,
        date: "2 days ago",
        text: "Best Pho in town! The broth is incredibly rich.",
      },
    ],
  },
  {
    id: "2",
    name: "Bánh Mì Huỳnh Hoa",
    rating: 4.6,
    reviewCount: 3500,
    priceRange: "$",
    address: "26 Le Thi Rieng, District 1, HCMC",
    tags: ["Street Food", "Bánh Mì", "Quick Bite", "Món mặn"],
    image:
      "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80",
    lat: 55,
    lng: 45,
    openNow: true,
    description:
      "Often hailed as the 'heaviest' Bánh Mì in Saigon, this spot is legendary for its sandwiches packed with multiple layers of cold cuts, homemade pâté, and creamy butter. Expect a queue, but it moves fast.",
    amenities: ["Takeout Only"],
    dishes: [
      {
        id: "d3",
        name: "Bánh Mì Đặc Biệt",
        price: "68,000",
        image:
          "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=400&q=80",
        isSignature: true,
        tags: ["Bánh Mì", "Street Food", "Món mặn"],
        description:
          "A fully loaded baguette with 5 types of ham, pork floss, pickles, and their famous melt-in-your-mouth pâté.",
      },
      {
        id: "d_coffee_2",
        name: "Cà phê sữa đá",
        price: "30,000",
        image:
          "https://images.unsplash.com/photo-1517701604599-bb29b5c7dd90?auto=format&fit=crop&w=400&q=80",
        isSignature: false,
        tags: ["Drinks", "Cà phê"],
        description:
          "Strong local coffee to balance the richness of the Bánh Mì.",
      },
    ],
    reviews: [],
  },
  {
    id: "3",
    name: "The Deck Saigon",
    rating: 4.7,
    reviewCount: 890,
    priceRange: "$$$$",
    address: "38 Nguyen U Di, District 2, HCMC",
    tags: [
      "Fine Dining",
      "River View",
      "Seafood",
      "Drinks",
      "Hải sản",
    ],
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
    lat: 70,
    lng: 20,
    openNow: false,
    description:
      "Escape the city hustle at this premier riverside dining venue. Known for its romantic sunset views over the Saigon River, The Deck offers a sophisticated Pan-Asian menu and handcrafted cocktails in an open-air setting.",
    amenities: ["Wifi", "Valet Parking", "Bar", "River View"],
    dishes: [
      {
        id: "d4",
        name: "Cua Rang Me",
        price: "450,000",
        image:
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80",
        isSignature: true,
        tags: ["Seafood", "Hải sản", "Món mặn"],
        description:
          "Wok-fried mud crab tossed in a tangy tamarind sauce with garlic and chili.",
      },
      {
        id: "d_cocktail",
        name: "Sunset Cocktail",
        price: "220,000",
        image:
          "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80",
        isSignature: true,
        tags: ["Drinks", "Cocktail"],
        description:
          "Signature gin-based cocktail with lemongrass and ginger, perfect for the river breeze.",
      },
      {
        id: "d_springroll_lux",
        name: "Gỏi Cuốn",
        price: "180,000",
        image:
          "https://images.unsplash.com/photo-1548029960-695d127f4543?auto=format&fit=crop&w=400&q=80",
        isSignature: false,
        tags: ["Appetizer", "Vietnamese", "Seafood"],
        description:
          "Premium fresh rolls with tiger prawns, organic herbs, and a hoisin peanut dip.",
      },
    ],
    reviews: [],
  },
  {
    id: "4",
    name: "Secret Garden",
    rating: 4.5,
    reviewCount: 600,
    priceRange: "$$",
    address: "158 Pasteur, District 1, HCMC",
    tags: ["Vietnamese", "Rooftop", "Cozy", "Cơm gia đình"],
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    lat: 42,
    lng: 35,
    openNow: true,
    description:
      "Hidden on the rooftop of an old apartment block, this restaurant transports you to a countryside garden. Enjoy authentic, home-style Vietnamese comfort food amidst lanterns, vines, and a cozy, nostalgic atmosphere.",
    amenities: ["Wifi", "Rooftop", "Outdoor Seating"],
    dishes: [
      {
        id: "d5",
        name: "Thịt Kho Tàu",
        price: "110,000",
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
        isSignature: true,
        tags: ["Vietnamese", "Cơm gia đình", "Món mặn"],
        description:
          "Caramelized pork belly braised in coconut water with eggs, a classic family staple.",
      },
      {
        id: "d_canhchua",
        name: "Canh Chua Cá Lóc",
        price: "120,000",
        image:
          "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80",
        isSignature: true,
        tags: ["Soup", "Vietnamese", "Seafood"],
        description:
          "Sweet and sour soup with snakehead fish, tamarind, pineapple, and elephant ear stems.",
      },
      {
        id: "d_goicuon_2",
        name: "Gỏi Cuốn",
        price: "65,000",
        image:
          "https://images.unsplash.com/photo-1548029960-695d127f4543?auto=format&fit=crop&w=400&q=80",
        isSignature: false,
        tags: ["Appetizer", "Vietnamese"],
        description:
          "Traditional fresh spring rolls served with a rustic country-style dipping sauce.",
      },
    ],
    reviews: [],
  },
  {
    id: "5",
    name: "Pizza 4P's Ben Thanh",
    rating: 4.9,
    reviewCount: 2100,
    priceRange: "$$$",
    address: "8 Thu Khoa Huan, District 1, HCMC",
    tags: ["Món ngọt", "Pizza", "Seafood", "Hải sản"],
    image:
      "https://images.unsplash.com/photo-1574129645730-0968ac20c512?auto=format&fit=crop&w=800&q=80",
    lat: 48,
    lng: 42,
    openNow: true,
    description:
      "A pioneer of Japanese-Italian fusion in Vietnam, situated near Ben Thanh Market. Famous for their house-made cheeses produced in Dalat, specifically the creamy Burrata, paired with wood-fired pizzas.",
    amenities: ["Wifi", "AC", "Reservations Recommended"],
    dishes: [
      {
        id: "d6",
        name: "Pizza 4 Cheese",
        price: "280,000",
        image:
          "https://images.unsplash.com/photo-1574129645730-0968ac20c512?auto=format&fit=crop&w=400&q=80",
        isSignature: true,
        tags: ["Pizza", "Italian", "Món mặn", "Món ngọt"],
        description:
          "Signature pizza featuring four types of house-made cheese, served with honey.",
      },
      {
        id: "d_crab_pasta",
        name: "Mì Ý Cua",
        price: "240,000",
        image:
          "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=400&q=80",
        isSignature: true,
        tags: ["Pasta", "Seafood", "Italian"],
        description:
          "Creamy tomato spaghetti with crab meat and rich ricotta cheese.",
      },
    ],
    reviews: [],
  },
  {
    id: "6",
    name: "Cục Gạch Quán",
    rating: 4.4,
    reviewCount: 500,
    priceRange: "$$",
    address: "10 Dang Tat, District 1, HCMC",
    tags: ["Vietnamese", "Vintage", "Chay", "Phở", "Family"],
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
    lat: 30,
    lng: 60,
    openNow: true,
    description:
      "Housed in a beautifully restored French colonial villa, Cục Gạch Quán serves pure, rustic Vietnamese dishes. The philosophy here is 'eat green, live green', featuring traditional clay pot dishes and fresh vegetables.",
    amenities: ["Wifi", "Garden"],
    dishes: [
      {
        id: "d7",
        name: "Đậu Hũ Chiên Sả",
        price: "85,000",
        image:
          "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=400&q=80",
        isSignature: true,
        tags: ["Chay", "Tofu", "Vietnamese"],
        description:
          "Crispy fried tofu cubes tossed with fragrant lemongrass and chili.",
      },
      {
        id: "d_pho_lux",
        name: "Phở Bò Đặc Biệt",
        price: "130,000",
        image:
          "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80",
        isSignature: false,
        tags: ["Phở", "Món nước", "Vietnamese"],
        description:
          "Premium version of Pho with wagyu beef slices and hand-pulled noodles.",
      },
      {
        id: "d_coffee_3",
        name: "Cà phê sữa đá",
        price: "65,000",
        image:
          "https://images.unsplash.com/photo-1517701604599-bb29b5c7dd90?auto=format&fit=crop&w=400&q=80",
        isSignature: false,
        tags: ["Drinks", "Cà phê"],
        description:
          "Slow-drip iced coffee served in vintage ceramic ware.",
      },
    ],
    reviews: [],
  },
];

export const MOCK_TOURS: Tour[] = [
  {
    id: "t1",
    title: "Saigon Street Food Adventure",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    duration: "3 hours",
    distance: "4.5 km",
    stops: 5,
    rating: 4.9,
    tags: ["Foodie", "Street Food", "Budget"],
    description:
      "Experience the bustling streets of Saigon and taste the best local street foods like Bánh Mì, Grilled Rice Paper, and Sugarcane Juice.",
  },
  {
    id: "t2",
    title: "Hidden Coffee Gems",
    image:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80",
    duration: "2 hours",
    distance: "2.0 km",
    stops: 3,
    rating: 4.7,
    tags: ["Coffee", "Cultural", "Morning"],
    description:
      "A relaxing morning tour exploring the hidden café apartments and vintage coffee shops of District 1.",
  },
  {
    id: "t3",
    title: "Vegetarian Delights",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    duration: "2.5 hours",
    distance: "3.2 km",
    stops: 4,
    rating: 4.5,
    tags: ["Chay", "Healthy", "Lunch"],
    description:
      "Discover the amazing world of Vietnamese vegetarian cuisine, from savory noodle soups to crispy tofu dishes.",
  },
];
