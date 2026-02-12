import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    const result = await signup(name, email, password);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Signup failed");
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
        <div className="w-full max-w-md text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Check Your Email</h1>
          <p className="text-muted-foreground mb-6">We've sent a confirmation link to <strong>{email}</strong>. Please verify your email to continue.</p>
          <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-center text-muted-foreground mb-8">Join FurniShop today</p>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Min. 6 characters" />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium btn-transition">
            Create Account
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
