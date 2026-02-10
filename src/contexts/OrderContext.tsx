import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem } from "./CartContext";

export interface Order {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  paymentMethod: "COD" | "Online";
  date: string;
  address: string;
}

interface OrderContextType {
  orders: Order[];
  placeOrder: (order: Omit<Order, "id" | "date" | "status">) => Order;
  getUserOrders: (userId: number) => Order[];
  updateOrderStatus: (orderId: number, status: Order["status"]) => void;
  cancelOrder: (orderId: number) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = localStorage.getItem("furnishop_orders");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("furnishop_orders", JSON.stringify(orders));
  }, [orders]);

  const placeOrder = (orderData: Omit<Order, "id" | "date" | "status">): Order => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now(),
      date: new Date().toISOString(),
      status: "Pending",
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const getUserOrders = (userId: number) => orders.filter(o => o.userId === userId);

  const updateOrderStatus = (orderId: number, status: Order["status"]) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const cancelOrder = (orderId: number) => {
    setOrders(prev => prev.map(o => o.id === orderId && o.status === "Pending" ? { ...o, status: "Cancelled" } : o));
  };

  return (
    <OrderContext.Provider value={{ orders, placeOrder, getUserOrders, updateOrderStatus, cancelOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
};
