import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { CreditCard, Banknote, Smartphone } from "lucide-react";

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Online">("COD");
  const [processing, setProcessing] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardType, setCardType] = useState<"debit" | "credit" | "upi">("debit");

  // UPI state
  const [upiId, setUpiId] = useState("");

  if (!user || items.length === 0) {
    navigate("/cart");
    return null;
  }

  const shipping = total > 40000 ? 0 : 4999;
  const gst = Math.round(total * 0.18);
  const grandTotal = total + shipping + gst;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) return v.substring(0, 2) + "/" + v.substring(2, 4);
    return v;
  };

  const isOnlineFormValid = () => {
    if (cardType === "upi") return upiId.includes("@");
    return cardNumber.replace(/\s/g, "").length === 16 && cardName.trim() && cardExpiry.length === 5 && cardCvv.length === 3;
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) return;
    if (paymentMethod === "Online" && !isOnlineFormValid()) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    const order = placeOrder({
      userId: user.id,
      items,
      total: grandTotal,
      paymentMethod,
      address,
    });
    clearCart();
    navigate("/order-success", { state: { orderId: order.id } });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      <div className="space-y-6">
        {/* Address */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Delivery Address</h2>
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter your full delivery address..."
            rows={3}
            className="w-full p-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {/* Payment */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Payment Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("COD")}
              className={`flex items-center gap-3 p-4 rounded-md border-2 transition-colors ${paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-input"}`}
            >
              <Banknote size={20} className="text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm text-foreground">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">Pay when you receive</p>
              </div>
            </button>
            <button
              onClick={() => setPaymentMethod("Online")}
              className={`flex items-center gap-3 p-4 rounded-md border-2 transition-colors ${paymentMethod === "Online" ? "border-primary bg-primary/5" : "border-input"}`}
            >
              <CreditCard size={20} className="text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm text-foreground">Online Payment</p>
                <p className="text-xs text-muted-foreground">Debit / Credit / UPI</p>
              </div>
            </button>
          </div>

          {/* Online Payment Form */}
          {paymentMethod === "Online" && (
            <div className="mt-6 space-y-4 border-t border-border pt-6">
              {/* Card Type Tabs */}
              <div className="flex gap-2">
                {([
                  { key: "debit", label: "Debit Card", icon: CreditCard },
                  { key: "credit", label: "Credit Card", icon: CreditCard },
                  { key: "upi", label: "UPI", icon: Smartphone },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setCardType(key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${cardType === key ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                  >
                    <Icon size={14} />{label}
                  </button>
                ))}
              </div>

              {cardType === "upi" ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Demo: Enter any valid UPI ID format</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Name on Card</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      placeholder="Full name as on card"
                      className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
                        placeholder="•••"
                        maxLength={3}
                        className="w-full p-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Demo: Enter any 16-digit card number to simulate payment</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Billing Summary */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Billing Summary</h2>
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex justify-between text-sm py-1">
              <span className="text-muted-foreground">{product.name} × {quantity}</span>
              <span className="text-foreground font-medium">₹{(product.price * quantity).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <div className="border-t border-border mt-3 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>GST (18%)</span>
              <span>₹{gst.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
              <span>Grand Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={!address.trim() || processing || (paymentMethod === "Online" && !isOnlineFormValid())}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium btn-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</> : `Pay ₹${grandTotal.toLocaleString("en-IN")}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
