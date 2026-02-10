export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  featured?: boolean;
}

export const categories = [
  "Living Room",
  "Bedroom",
  "Dining",
  "Office",
  "Outdoor",
];

export const products: Product[] = [
  {
    id: 1,
    name: "Nordic Lounge Chair",
    price: 49999,
    category: "Living Room",
    description: "A beautifully crafted lounge chair with solid oak legs and premium linen upholstery. Perfect for reading corners and living spaces. Features ergonomic design for maximum comfort.",
    image: "https://images.unsplash.com/photo-1567538096621-38d2284b23ff?w=600&h=600&fit=crop",
    featured: true,
  },
  {
    id: 2,
    name: "Minimalist Coffee Table",
    price: 28999,
    category: "Living Room",
    description: "Clean-lined coffee table crafted from solid walnut with a natural oil finish. The perfect centerpiece for any modern living room.",
    image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&h=600&fit=crop",
    featured: true,
  },
  {
    id: 3,
    name: "Velvet Sofa - Forest",
    price: 109999,
    category: "Living Room",
    description: "Luxurious three-seater sofa in deep forest green velvet. Solid beech frame with high-resilience foam cushions for lasting comfort.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
    featured: true,
  },
  {
    id: 4,
    name: "Oak Platform Bed",
    price: 74999,
    category: "Bedroom",
    description: "Solid white oak platform bed with a floating design. Includes slatted base — no box spring needed. Available in Queen and King sizes.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop",
  },
  {
    id: 5,
    name: "Walnut Nightstand",
    price: 20999,
    category: "Bedroom",
    description: "Compact nightstand in American walnut with a single drawer and open shelf. Soft-close hardware included.",
    image: "https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=600&h=600&fit=crop",
  },
  {
    id: 6,
    name: "Linen Upholstered Headboard",
    price: 37999,
    category: "Bedroom",
    description: "Channel-tufted headboard in natural linen. Wall-mountable with adjustable height brackets.",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=600&fit=crop",
  },
  {
    id: 7,
    name: "Extendable Dining Table",
    price: 66999,
    category: "Dining",
    description: "Seats 4-8 comfortably with a hidden butterfly leaf extension. Solid ash construction with a matte lacquer finish.",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=600&fit=crop",
    featured: true,
  },
  {
    id: 8,
    name: "Woven Dining Chair",
    price: 16999,
    category: "Dining",
    description: "Paper cord woven seat on a solid oak frame. Inspired by mid-century Scandinavian design. Sold individually.",
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=600&fit=crop",
  },
  {
    id: 9,
    name: "Standing Desk - Adjustable",
    price: 54999,
    category: "Office",
    description: "Electric height-adjustable desk with bamboo top. Dual motors for smooth, quiet adjustment. Memory presets for your favorite heights.",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=600&fit=crop",
  },
  {
    id: 10,
    name: "Ergonomic Task Chair",
    price: 41999,
    category: "Office",
    description: "Breathable mesh back with adjustable lumbar support, armrests, and seat depth. Built for long work sessions.",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop",
  },
  {
    id: 11,
    name: "Teak Garden Bench",
    price: 45999,
    category: "Outdoor",
    description: "Grade-A teak bench that weathers beautifully over time. Seats three comfortably. Stainless steel hardware.",
    image: "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?w=600&h=600&fit=crop",
  },
  {
    id: 12,
    name: "Rattan Lounge Set",
    price: 99999,
    category: "Outdoor",
    description: "All-weather synthetic rattan set including two armchairs and a side table. UV-resistant and easy to clean.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&h=600&fit=crop",
  },
];
