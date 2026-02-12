import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface OrderItem {
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  product_id: number;
}

export interface Order {
  id: number;
  user_id: string;
  total: number;
  status: string;
  payment_method: string;
  address: string;
  created_at: string;
  items: OrderItem[];
}

interface OrderContextType {
  orders: Order[];
  placeOrder: (order: { total: number; payment_method: string; address: string; items: OrderItem[] }) => Promise<Order | null>;
  getUserOrders: () => Order[];
  updateOrderStatus: (orderId: number, status: string) => Promise<void>;
  cancelOrder: (orderId: number) => Promise<void>;
  allOrders: Order[];
  fetchAllOrders: () => Promise<void>;
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserOrders = useCallback(async () => {
    if (!user) { setOrders([]); return; }
    setLoading(true);
    const { data: orderRows } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!orderRows) { setLoading(false); return; }

    const ordersWithItems: Order[] = await Promise.all(
      orderRows.map(async (o: any) => {
        const { data: items } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", o.id);
        return { ...o, items: items ?? [] };
      })
    );
    setOrders(ordersWithItems);
    setLoading(false);
  }, [user]);

  const fetchAllOrders = useCallback(async () => {
    if (!isAdmin) return;
    const { data: orderRows } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!orderRows) return;

    const ordersWithItems: Order[] = await Promise.all(
      orderRows.map(async (o: any) => {
        const { data: items } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", o.id);
        return { ...o, items: items ?? [] };
      })
    );
    setAllOrders(ordersWithItems);
  }, [isAdmin]);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const placeOrder = async (orderData: { total: number; payment_method: string; address: string; items: OrderItem[] }) => {
    if (!user) return null;
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total: orderData.total,
        payment_method: orderData.payment_method,
        address: orderData.address,
      })
      .select()
      .single();

    if (error || !order) return null;

    const itemsToInsert = orderData.items.map(i => ({
      order_id: (order as any).id,
      product_id: i.product_id,
      product_name: i.product_name,
      product_image: i.product_image,
      price: i.price,
      quantity: i.quantity,
    }));

    await supabase.from("order_items").insert(itemsToInsert);
    await fetchUserOrders();
    return { ...(order as any), items: orderData.items };
  };

  const getUserOrders = () => orders;

  const updateOrderStatus = async (orderId: number, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    await fetchAllOrders();
    await fetchUserOrders();
  };

  const cancelOrder = async (orderId: number) => {
    await supabase.from("orders").update({ status: "Cancelled" }).eq("id", orderId);
    await fetchUserOrders();
  };

  return (
    <OrderContext.Provider value={{ orders, placeOrder, getUserOrders, updateOrderStatus, cancelOrder, allOrders, fetchAllOrders, loading }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
};
