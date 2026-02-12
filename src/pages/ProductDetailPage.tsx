import React from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();
  const { products, loading } = useProducts();

  if (loading) return <LoadingSpinner />;

  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-2xl font-bold mb-4">Product Not Found</h2>
        <Link to="/products" className="text-primary hover:underline">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} /> Back to shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
          <img src={product.image || ""} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">{product.category}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
          </div>
          <p className="text-2xl font-bold text-foreground">₹{product.price.toLocaleString("en-IN")}</p>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          {!isAdmin && (
            <button
              onClick={() => addToCart(product)}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium btn-transition w-full md:w-auto"
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
