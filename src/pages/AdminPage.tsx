import React, { useState, useMemo } from "react";
import { useAuth, User } from "@/contexts/AuthContext";
import { useOrders, Order } from "@/contexts/OrderContext";
import { products as defaultProducts, Product, categories } from "@/data/products";
import { Navigate } from "react-router-dom";
import {
  Package, Users, ShoppingBag, Plus, Pencil, Trash2, X,
  Search, IndianRupee, TrendingUp, Filter, Shield, UserX,
} from "lucide-react";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const { orders, updateOrderStatus } = useOrders();
  const [tab, setTab] = useState<"dashboard" | "products" | "orders" | "users">("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("All");
  const [userSearch, setUserSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [productList, setProductList] = useState<Product[]>(() => {
    const stored = localStorage.getItem("furnishop_products");
    return stored ? JSON.parse(stored) : defaultProducts;
  });

  const saveProducts = (list: Product[]) => {
    setProductList(list);
    localStorage.setItem("furnishop_products", JSON.stringify(list));
  };

  const [form, setForm] = useState({ name: "", price: "", category: categories[0], description: "", image: "", featured: false });

  const [userList, setUserList] = useState<(User & { password?: string })[]>(() => {
    const stored = localStorage.getItem("furnishop_users");
    return stored ? JSON.parse(stored) : [
      { id: 1, name: "Admin", email: "admin@furnishop.com", role: "admin" },
      { id: 2, name: "John Doe", email: "john@example.com", role: "user" },
    ];
  });

  const saveUsers = (list: (User & { password?: string })[]) => {
    setUserList(list);
    localStorage.setItem("furnishop_users", JSON.stringify(list));
  };

  if (!user || !isAdmin) return <Navigate to="/login" />;

  // Dashboard stats
  const totalRevenue = orders.reduce((sum, o) => o.status !== "Cancelled" ? sum + o.total : sum, 0);
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const deliveredOrders = orders.filter(o => o.status === "Delivered").length;
  const cancelledOrders = orders.filter(o => o.status === "Cancelled").length;

  // Filtered products
  const filteredProducts = productList.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filtered orders
  const filteredOrders = orderFilter === "All" ? orders : orders.filter(o => o.status === orderFilter);

  // Filtered users
  const filteredUsers = userList.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const openAddForm = () => {
    setEditProduct(null);
    setForm({ name: "", price: "", category: categories[0], description: "", image: "", featured: false });
    setShowForm(true);
  };

  const openEditForm = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, price: String(p.price), category: p.category, description: p.description, image: p.image, featured: !!p.featured });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (editProduct) {
      saveProducts(productList.map(p => p.id === editProduct.id ? { ...p, name: form.name, price: Number(form.price), category: form.category, description: form.description, image: form.image, featured: form.featured } : p));
    } else {
      const newProduct: Product = {
        id: Date.now(), name: form.name, price: Number(form.price), category: form.category,
        description: form.description,
        image: form.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
        featured: form.featured,
      };
      saveProducts([...productList, newProduct]);
    }
    setShowForm(false);
  };

  const handleDeleteProduct = (id: number) => {
    if (deleteConfirm === id) {
      saveProducts(productList.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleToggleRole = (userId: number) => {
    if (userId === user.id) return; // can't change own role
    saveUsers(userList.map(u => u.id === userId ? { ...u, role: u.role === "admin" ? "user" as const : "admin" as const } : u));
  };

  const handleDeleteUser = (userId: number) => {
    if (userId === user.id) return; // can't delete self
    if (deleteConfirm === userId) {
      saveUsers(userList.filter(u => u.id !== userId));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(userId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: TrendingUp },
    { key: "products", label: "Products", icon: Package },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "users", label: "Users", icon: Users },
  ] as const;

  const statCards = [
    { label: "Total Products", value: productList.length, icon: Package, color: "text-primary" },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-accent" },
    { label: "Total Users", value: userList.length, icon: Users, color: "text-foreground" },
    { label: "Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-green-600" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
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

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statCards.map(s => (
              <div key={s.label} className="bg-card border border-border rounded-lg p-5 text-center">
                <s.icon size={20} className={`mx-auto mb-2 ${s.color}`} />
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
              <p className="text-xs text-muted-foreground mt-1">Pending</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{deliveredOrders}</p>
              <p className="text-xs text-muted-foreground mt-1">Delivered</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{cancelledOrders}</p>
              <p className="text-xs text-muted-foreground mt-1">Cancelled</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{orders.length - pendingOrders - deliveredOrders - cancelledOrders}</p>
              <p className="text-xs text-muted-foreground mt-1">Shipped</p>
            </div>
          </div>

          {/* Recent Orders */}
          {orders.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold mb-3">Recent Orders</h2>
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-sm">#{order.id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm">₹{order.total.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "Delivered" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            order.status === "Shipped" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                            order.status === "Cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>{order.status}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS */}
      {tab === "products" && (
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button onClick={openAddForm} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium btn-transition">
              <Plus size={16} /> Add Product
            </button>
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search products..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <p className="text-xs text-muted-foreground">{filteredProducts.length} product(s)</p>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(p => (
                  <TableRow key={p.id}>
                    <TableCell><img src={p.image} alt={p.name} className="w-12 h-12 rounded object-cover" /></TableCell>
                    <TableCell className="font-medium text-sm">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-sm">₹{p.price.toLocaleString("en-IN")}</TableCell>
                    <TableCell>{p.featured ? <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Yes</span> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
                    <TableCell className="text-right">
                      <button onClick={() => openEditForm(p)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => handleDeleteProduct(p.id)} className={`p-2 transition-colors ${deleteConfirm === p.id ? "text-destructive font-bold" : "text-muted-foreground hover:text-destructive"}`}>
                        <Trash2 size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No products found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ORDERS */}
      {tab === "orders" && (
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Filter size={16} className="text-muted-foreground" />
            {["All", "Pending", "Shipped", "Delivered", "Cancelled"].map(status => (
              <button
                key={status}
                onClick={() => setOrderFilter(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${orderFilter === status ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
              >
                {status}
              </button>
            ))}
            <p className="text-xs text-muted-foreground ml-auto">{filteredOrders.length} order(s)</p>
          </div>

          {filteredOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders found.</p>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-sm">#{order.id}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{order.items.map(i => `${i.product.name} ×${i.quantity}`).join(", ")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{order.paymentMethod}</TableCell>
                      <TableCell className="text-sm font-medium">₹{order.total.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{order.address}</TableCell>
                      <TableCell>
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value as Order["status"])}
                          className={`text-xs border border-input rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                            order.status === "Delivered" ? "text-green-600" :
                            order.status === "Cancelled" ? "text-red-600" :
                            order.status === "Shipped" ? "text-blue-600" : "text-yellow-600"
                          }`}
                        >
                          <option>Pending</option>
                          <option>Shipped</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* USERS */}
      {tab === "users" && (
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search users..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <p className="text-xs text-muted-foreground">{filteredUsers.length} user(s)</p>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-sm">{u.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {u.id !== user.id && (
                        <>
                          <button
                            onClick={() => handleToggleRole(u.id)}
                            title={u.role === "admin" ? "Demote to user" : "Promote to admin"}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Shield size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className={`p-2 transition-colors ${deleteConfirm === u.id ? "text-destructive font-bold" : "text-muted-foreground hover:text-destructive"}`}
                          >
                            <UserX size={16} />
                          </button>
                        </>
                      )}
                      {u.id === user.id && <span className="text-xs text-muted-foreground italic">You</span>}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No users found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
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
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="rounded" />
              Mark as Featured
            </label>
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
