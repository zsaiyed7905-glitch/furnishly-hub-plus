import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard } from "lucide-react";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await login(email, password);
    if (success) {
      const stored = localStorage.getItem("furnishop_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === "admin") {
          navigate("/admin");
          return;
        }
      }
      setError("This account does not have admin access");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-2">
          <LayoutDashboard className="text-primary" size={28} />
          <h1 className="font-display text-3xl font-bold text-center">Admin Login</h1>
        </div>
        <p className="text-center text-muted-foreground mb-8">Sign in to the admin panel</p>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="admin@furnishop.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium btn-transition">
            Sign In as Admin
          </button>
        </form>

        <div className="mt-6 bg-secondary/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">Admin Credentials:</p>
          <p>Email: admin@furnishop.com</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
