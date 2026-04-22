// added a simple checkout page that reads cart items from localStorage, calculates totals, and has a form for customer info. 
// No real payment processing or backend integration yet, just simulating order placement and clearing the cart.
// will expand on this later with better styling, validation, and maybe a mock API call to "place" the order. :DDD 

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CART_STORAGE_KEY = "cart";
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

  useEffect(() => {
    const rawCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!rawCart) {
      setCartItems([]);
      return;
    }

    try {
      const parsed = JSON.parse(rawCart);
      if (Array.isArray(parsed)) {
        setCartItems(parsed);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error parsing checkout cart items:", error);
      setCartItems([]);
    }
  }, []);

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

    // optional: save order somewhere later
    // localStorage.setItem("lastOrder", JSON.stringify(orderData));

    // clear cart after successful order
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new Event("cart-updated"));

    alert("Order placed successfully!");

    navigate("/");
  };

  if (cartItems.length === 0) {
    return (
      <main style={{ maxWidth: 1000, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <button onClick={() => navigate("/cart")}>Back to Cart</button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1000, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Checkout</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <form
          onSubmit={handlePlaceOrder}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "1.5rem",
          }}
        >
          <h2>Billing Details</h2>

          <div style={{ display: "grid", gap: "1rem" }}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={customerInfo.fullName}
              onChange={handleInputChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={customerInfo.email}
              onChange={handleInputChange}
            />

            <input
              type="text"
              name="address"
              placeholder="Street Address"
              value={customerInfo.address}
              onChange={handleInputChange}
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={customerInfo.city}
              onChange={handleInputChange}
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={customerInfo.state}
              onChange={handleInputChange}
            />

            <input
              type="text"
              name="zipCode"
              placeholder="ZIP Code"
              value={customerInfo.zipCode}
              onChange={handleInputChange}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: "1.5rem",
              padding: "0.8rem 1.2rem",
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            Place Order
          </button>
        </form>

        <aside
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "1.5rem",
          }}
        >
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div
              key={item.id}
              style={{
                borderBottom: "1px solid #eee",
                paddingBottom: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <h4 style={{ margin: 0 }}>{item.title}</h4>
              <p style={{ margin: "0.25rem 0" }}>
                ${item.price.toFixed(2)} × {item.quantity}
              </p>
              <p style={{ margin: 0, fontWeight: 600 }}>
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}

          <div style={{ marginTop: "1rem" }}>
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Tax: ${tax.toFixed(2)}</p>
            <h3>Total: ${total.toFixed(2)}</h3>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;