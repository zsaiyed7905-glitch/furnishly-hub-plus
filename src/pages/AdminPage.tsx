import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders, Order } from "@/contexts/OrderContext";
import { products as defaultProducts, Product, categories } from "@/data/products";
import { Navigate } from "react-router-dom";
import { Package, Users, ShoppingBag, Plus, Pencil, Trash2, X } from "lucide-react";

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const { orders, updateOrderStatus } = useOrders();
  const [tab, setTab] = useState<"dashboard" | "products" | "orders" | "users">("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [productList, setProductList] = useState<Product[]>(() => {
    const stored = localStorage.getItem("furnishop_products");
    return stored ? JSON.parse(stored) : defaultProducts;
  });

  const saveProducts = (list: Product[]) => {
    setProductList(list);
    localStorage.setItem("furnishop_products", JSON.stringify(list));
  };

  const [form, setForm] = useState({ name: "", price: "", category: categories[0], description: "", image: "" });

  const users = useMemo(() => {
    const stored = localStorage.getItem("furnishop_users");
    return stored ? JSON.parse(stored) : [
      { id: 1, name: "Admin", email: "admin@furnishop.com", role: "admin" },
      { id: 2, name: "John Doe", email: "john@example.com", role: "user" },
    ];
  }, []);

  if (!user || !isAdmin) return <Navigate to="/login" />;

  const openAddForm = () => {
    setEditProduct(null);
    setForm({ name: "", price: "", category: categories[0], description: "", image: "" });
    setShowForm(true);
  };

  const openEditForm = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, price: String(p.price), category: p.category, description: p.description, image: p.image });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (editProduct) {
      saveProducts(productList.map(p => p.id === editProduct.id ? { ...p, name: form.name, price: Number(form.price), category: form.category, description: form.description, image: form.image } : p));
    } else {
      const newProduct: Product = { id: Date.now(), name: form.name, price: Number(form.price), category: form.category, description: form.description, image: form.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop" };
      saveProducts([...productList, newProduct]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    saveProducts(productList.filter(p => p.id !== id));
  };

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: ShoppingBag },
    { key: "products", label: "Products", icon: Package },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "users", label: "Users", icon: Users },
  ] as const;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${tab === key ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
          >
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-primary">{productList.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Products</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-accent">{orders.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Orders</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-foreground">{users.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Users</p>
          </div>
        </div>
      )}

      {tab === "products" && (
        <div>
          <button onClick={openAddForm} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium btn-transition mb-6">
            <Plus size={16} /> Add Product
          </button>
          <div className="grid gap-3">
            {productList.map(p => (
              <div key={p.id} className="flex items-center gap-4 bg-card border border-border rounded-lg p-4">
                <img src={p.image} alt={p.name} className="w-14 h-14 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category} · ₹{p.price.toLocaleString("en-IN")}</p>
                </div>
                <button onClick={() => openEditForm(p)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders yet.</p>
          ) : orders.map(order => (
            <div key={order.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-medium text-foreground text-sm">Order #{order.id}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleString()} · {order.paymentMethod} · ₹{order.total.toLocaleString("en-IN")}</p>
                </div>
                <select
                  value={order.status}
                  onChange={e => updateOrderStatus(order.id, e.target.value as Order["status"])}
                  className="text-sm border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Pending</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground">Items: {order.items.map(i => `${i.product.name} ×${i.quantity}`).join(", ")}</p>
              <p className="text-xs text-muted-foreground mt-1">Address: {order.address}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-3">
          {users.map((u: any) => (
            <div key={u.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
              <div>
                <p className="font-medium text-foreground text-sm">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                {u.role}
              </span>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-lg p-6 w-full max-w-md space-y-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{editProduct ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <input placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input placeholder="Price (₹)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
              className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <input placeholder="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })}
              className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={handleSave} className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium btn-transition">
              {editProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
