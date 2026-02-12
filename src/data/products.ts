export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string | null;
  image: string | null;
  featured?: boolean;
  original_price?: number | null;
  rating?: number | null;
  reviews?: number | null;
  in_stock?: boolean | null;
}

export const categories = [
  "Living Room",
  "Bedroom",
  "Dining",
  "Office",
  "Outdoor",
];
