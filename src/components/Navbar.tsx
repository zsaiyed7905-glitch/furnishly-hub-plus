import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight text-foreground">
          Furni<span className="text-primary">Shop</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
          {user && !isAdmin && (
            <Link to="/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">My Orders</Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <LayoutDashboard size={16} />Admin
            </Link>
          )}
          {!isAdmin && (
            <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <button onClick={logout} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md btn-transition">
                <User size={16} />Login
              </Link>
              <Link to="/admin-login" className="flex items-center gap-1.5 text-sm font-medium border border-primary text-primary px-4 py-2 rounded-md hover:bg-primary/10 transition-colors">
                <LayoutDashboard size={16} />Admin
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">Home</Link>
            <Link to="/products" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">Shop</Link>
            {user && !isAdmin && (
              <>
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 flex items-center gap-2">
                  Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">My Orders</Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-primary">Admin Panel</Link>
            )}
            {user ? (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm font-medium py-2 text-destructive text-left">Logout</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-primary">Login</Link>
                <Link to="/admin-login" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-primary">Admin Login</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
