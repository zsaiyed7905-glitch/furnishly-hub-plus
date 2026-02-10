import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERS: (User & { password: string })[] = [
  { id: 1, name: "Admin", email: "admin@furnishop.com", password: "admin123", role: "admin" },
  { id: 2, name: "John Doe", email: "john@example.com", password: "user123", role: "user" },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("furnishop_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const getUsers = (): (User & { password: string })[] => {
    const stored = localStorage.getItem("furnishop_users");
    return stored ? JSON.parse(stored) : DEFAULT_USERS;
  };

  const saveUsers = (users: (User & { password: string })[]) => {
    localStorage.setItem("furnishop_users", JSON.stringify(users));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      localStorage.setItem("furnishop_user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    if (users.find(u => u.email === email)) return false;
    const newUser = { id: Date.now(), name, email, password, role: "user" as const };
    saveUsers([...users, newUser]);
    const { password: _, ...userData } = newUser;
    setUser(userData);
    localStorage.setItem("furnishop_user", JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("furnishop_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
