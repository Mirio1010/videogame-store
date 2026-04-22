import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/CheckoutPage.css";
import { readCart, writeCart } from "../utils/cartStorage";

const TAX_RATE = 0.08875; // example 8.875%

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setCartItems(readCart(user));
  }, [user]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }, [cartItems]);

  const tax = useMemo(() => {
    return subtotal * TAX_RATE;
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (
      !customerInfo.fullName ||
      !customerInfo.email ||
      !customerInfo.address ||
      !customerInfo.city ||
      !customerInfo.state ||
      !customerInfo.zipCode
    ) {
      alert("Please fill out all checkout fields.");
      return;
    }

    const orderData = {
      customer: customerInfo,
      items: cartItems,
      subtotal,
      tax,
      total,
      createdAt: new Date().toISOString(),
    };

    console.log("Order placed:", orderData);

    writeCart(user, []);
    setCartItems([]);
    window.dispatchEvent(new Event("cart-updated"));

    alert("Order placed successfully!");

    navigate("/");
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page checkout-page--empty container">
        <section className="checkout-empty-state">
          <h1 className="checkout-title">Checkout</h1>
          <p className="checkout-subtitle">Your cart is empty.</p>
          <button className="checkout-secondary-btn" onClick={() => navigate("/cart")}>
            Back to Cart
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page container">
      <header className="checkout-hero">
        <p className="checkout-eyebrow">Secure Checkout</p>
        <h1 className="checkout-title">Complete your order</h1>
        <p className="checkout-subtitle">
          Review your cart, enter billing details, and place your order.
        </p>
      </header>

      <div className="checkout-layout">
        <form className="checkout-card" onSubmit={handlePlaceOrder}>
          <h2 className="checkout-section-title">Billing Details</h2>

          <div className="checkout-form-grid">
            <input
              className="checkout-input"
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={customerInfo.fullName}
              onChange={handleInputChange}
            />

            <input
              className="checkout-input"
              type="email"
              name="email"
              placeholder="Email Address"
              value={customerInfo.email}
              onChange={handleInputChange}
            />

            <input
              className="checkout-input checkout-input--full"
              type="text"
              name="address"
              placeholder="Street Address"
              value={customerInfo.address}
              onChange={handleInputChange}
            />

            <input
              className="checkout-input"
              type="text"
              name="city"
              placeholder="City"
              value={customerInfo.city}
              onChange={handleInputChange}
            />

            <input
              className="checkout-input"
              type="text"
              name="state"
              placeholder="State"
              value={customerInfo.state}
              onChange={handleInputChange}
            />

            <input
              className="checkout-input"
              type="text"
              name="zipCode"
              placeholder="ZIP Code"
              value={customerInfo.zipCode}
              onChange={handleInputChange}
            />
          </div>

          <button className="checkout-primary-btn" type="submit">
            Place Order
          </button>
        </form>

        <aside className="checkout-card checkout-summary">
          <h2 className="checkout-section-title">Order Summary</h2>

          {cartItems.map((item) => (
            <div key={item.id} className="checkout-summary-item">
              <h4 className="checkout-item-title">{item.title}</h4>
              <p className="checkout-item-meta">
                ${item.price.toFixed(2)} × {item.quantity}
              </p>
              <p className="checkout-item-total">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}

          <div className="checkout-totals">
            <p className="checkout-total-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </p>
            <p className="checkout-total-row">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </p>
            <h3 className="checkout-grand-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </h3>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;