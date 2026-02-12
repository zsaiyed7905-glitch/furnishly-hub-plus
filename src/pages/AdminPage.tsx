import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { useProducts } from "@/hooks/useProducts";
import { Product, categories } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import {
  Package, Users, ShoppingBag, Plus, Pencil, Trash2, X,
  Search, IndianRupee, TrendingUp, Filter, Shield, UserX,
} from "lucide-react";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ProfileUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role?: string;
}

const AdminPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { allOrders, fetchAllOrders, updateOrderStatus } = useOrders();
  const { products, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const [tab, setTab] = useState<"dashboard" | "products" | "orders" | "users">("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("All");
  const [userSearch, setUserSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", price: "", category: categories[0], description: "", image: "", featured: false });

  const [userList, setUserList] = useState<ProfileUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    setUsersLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");

    if (profiles) {
      const usersWithRoles = profiles.map((p: any) => {
        const userRoles = roles?.filter((r: any) => r.user_id === p.user_id) ?? [];
        const hasAdmin = userRoles.some((r: any) => r.role === "admin");
        return { ...p, role: hasAdmin ? "admin" : "user" };
      });
      setUserList(usersWithRoles);
    }
    setUsersLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllOrders();
      fetchUsers();
    }
  }, [isAdmin, fetchAllOrders, fetchUsers]);

  if (authLoading) return <LoadingSpinner />;
  if (!user || !isAdmin) return <Navigate to="/admin-login" />;

  const totalRevenue = allOrders.reduce((sum, o) => o.status !== "Cancelled" ? sum + o.total : sum, 0);
  const pendingOrders = allOrders.filter(o => o.status === "Pending").length;
  const deliveredOrders = allOrders.filter(o => o.status === "Delivered").length;
  const cancelledOrders = allOrders.filter(o => o.status === "Cancelled").length;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orderFilter === "All" ? allOrders : allOrders.filter(o => o.status === orderFilter);

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
    setForm({ name: p.name, price: String(p.price), category: p.category, description: p.description || "", image: p.image || "", featured: !!p.featured });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    const productData = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      description: form.description,
      image: form.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
      featured: form.featured,
    };

    if (editProduct) {
      await supabase.from("products").update(productData).eq("id", editProduct.id);
    } else {
      await supabase.from("products").insert(productData);
    }
    setShowForm(false);
    refetchProducts();
  };

  const handleDeleteProduct = async (id: number) => {
    if (deleteConfirm === id) {
      await supabase.from("products").delete().eq("id", id);
      setDeleteConfirm(null);
      refetchProducts();
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (userId === user.id) return;
    if (currentRole === "admin") {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: "admin" as any });
    }
    fetchUsers();
  };

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: TrendingUp },
    { key: "products", label: "Products", icon: Package },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "users", label: "Users", icon: Users },
  ] as const;

  const statCards = [
    { label: "Total Products", value: products.length, icon: Package, color: "text-primary" },
    { label: "Total Orders", value: allOrders.length, icon: ShoppingBag, color: "text-accent" },
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
              <p className="text-2xl font-bold text-blue-600">{allOrders.length - pendingOrders - deliveredOrders - cancelledOrders}</p>
              <p className="text-xs text-muted-foreground mt-1">Shipped</p>
            </div>
          </div>

          {allOrders.length > 0 && (
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
                    {allOrders.slice(0, 5).map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-sm">#{order.id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
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
              <input placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <p className="text-xs text-muted-foreground">{filteredProducts.length} product(s)</p>
          </div>

          {productsLoading ? <LoadingSpinner /> : (
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
                      <TableCell><img src={p.image || ""} alt={p.name} className="w-12 h-12 rounded object-cover" /></TableCell>
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
          )}
        </div>
      )}

      {/* ORDERS */}
      {tab === "orders" && (
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Filter size={16} className="text-muted-foreground" />
            {["All", "Pending", "Shipped", "Delivered", "Cancelled"].map(status => (
              <button key={status} onClick={() => setOrderFilter(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${orderFilter === status ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
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
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-sm">#{order.id}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{order.items.map(i => `${i.product_name} ×${i.quantity}`).join(", ")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{order.payment_method}</TableCell>
                      <TableCell className="text-sm font-medium">₹{order.total.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}
                          className={`text-xs border border-input rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                            order.status === "Delivered" ? "text-green-600" : order.status === "Cancelled" ? "text-red-600" : order.status === "Shipped" ? "text-blue-600" : "text-yellow-600"
                          }`}>
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
              <input placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <p className="text-xs text-muted-foreground">{filteredUsers.length} user(s)</p>
          </div>

          {usersLoading ? <LoadingSpinner /> : (
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
                    <TableRow key={u.user_id}>
                      <TableCell className="font-medium text-sm">{u.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {u.user_id !== user.id ? (
                          <button
                            onClick={() => handleToggleRole(u.user_id, u.role || "user")}
                            title={u.role === "admin" ? "Demote to user" : "Promote to admin"}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Shield size={16} />
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">You</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No users found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
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
