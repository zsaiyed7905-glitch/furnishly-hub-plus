import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { Package, XCircle } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const OrdersPage = () => {
  const { user } = useAuth();
  const { orders, cancelOrder, loading } = useOrders();

  if (!user) return null;

  const statusColor = (status: string) => {
    if (status === "Delivered") return "bg-primary/10 text-primary";
    if (status === "Shipped") return "bg-accent/10 text-accent";
    if (status === "Cancelled") return "bg-destructive/10 text-destructive";
    return "bg-secondary text-muted-foreground";
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-display font-semibold text-foreground">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-sm text-muted-foreground">{order.payment_method}</span>
                </div>
              </div>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded object-cover" />}
                    <span className="text-foreground">{item.product_name}</span>
                    <span className="text-muted-foreground">× {item.quantity}</span>
                    <span className="ml-auto font-medium text-foreground">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Delivery: {order.address}</span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-foreground">₹{order.total.toLocaleString("en-IN")}</span>
                  {order.status === "Pending" && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive text-xs font-medium rounded-md hover:bg-destructive/20 transition-colors"
                    >
                      <XCircle size={14} />
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
