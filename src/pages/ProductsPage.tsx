import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { products, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Search, SlidersHorizontal } from "lucide-react";

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [showFilters, setShowFilters] = useState(false);

  const allProducts = useMemo(() => {
    const stored = localStorage.getItem("furnishop_products");
    if (stored) return JSON.parse(stored);
    return products;
  }, []);

  const filtered = useMemo(() => {
    return allProducts.filter((p: any) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || p.category === category;
      const matchesPrice = p.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [allProducts, search, category, maxPrice]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8">Our Collection</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search furniture..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 border border-input rounded-md text-sm font-medium bg-card text-foreground btn-transition md:hidden"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <div className="flex gap-8">
        <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 shrink-0 space-y-6`}>
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Category</h3>
            <div className="space-y-2">
              <button
                onClick={() => setCategory("")}
                className={`block text-sm w-full text-left py-1 px-2 rounded ${!category ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"} transition-colors`}
              >
                All Categories
              </button>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`block text-sm w-full text-left py-1 px-2 rounded ${category === c ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"} transition-colors`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Max Price: ₹{maxPrice.toLocaleString("en-IN")}</h3>
            <input
              type="range"
              min={5000}
              max={200000}
              step={5000}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </aside>

        <div className="flex-1">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No products found matching your criteria.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
