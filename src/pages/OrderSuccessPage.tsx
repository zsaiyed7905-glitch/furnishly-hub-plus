import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const OrderSuccessPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
      <CheckCircle size={64} className="mx-auto text-primary mb-6" />
      <h1 className="font-display text-3xl font-bold mb-3">Order Placed Successfully!</h1>
      {orderId && <p className="text-muted-foreground mb-2">Order ID: #{orderId}</p>}
      <p className="text-muted-foreground mb-8">Thank you for your purchase. We'll start preparing your order right away.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/orders" className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium btn-transition">
          View My Orders
        </Link>
        <Link to="/products" className="border border-input text-foreground px-6 py-3 rounded-md font-medium btn-transition">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
