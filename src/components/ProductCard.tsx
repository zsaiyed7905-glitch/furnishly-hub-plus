import React from "react";
import { Product } from "@/data/products";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const { user, isAdmin } = useAuth();

  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden hover-lift">
      <Link to={`/products/${product.id}`} className="block aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>
      <div className="p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
          {!isAdmin && (
            <button
              onClick={() => addToCart(product)}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm px-3 py-1.5 rounded-md btn-transition"
            >
              <ShoppingCart size={14} />Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
