import React from "react";
import { Link } from "react-router-dom";
import { categories } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Truck, Shield, Headphones } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const HomePage = () => {
  const { products, loading } = useProducts();
  const featured = products.filter(p => p.featured);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-secondary overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Furniture for<br />
              <span className="text-primary">Modern Living</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Thoughtfully designed pieces that bring warmth and character to every room in your home.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium btn-transition"
            >
              Shop Collection <ArrowRight size={18} />
            </Link>
          </div>
          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&h=500&fit=crop"
              alt="Modern furniture"
              className="rounded-lg shadow-2xl w-full max-w-lg mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-10">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map(cat => (
            <Link
              key={cat}
              to={`/products?category=${encodeURIComponent(cat)}`}
              className="bg-secondary text-center py-6 rounded-lg font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-display text-3xl font-bold">Featured Pieces</h2>
          <Link to="/products" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Trust */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders over ₹40,000" },
            { icon: Shield, title: "5-Year Warranty", desc: "Quality guaranteed" },
            { icon: Headphones, title: "24/7 Support", desc: "We're here to help" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-3">
              <Icon size={32} className="text-primary" />
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
