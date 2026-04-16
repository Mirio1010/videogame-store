import { useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "cart";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const rawCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!rawCart) return;

    try {
      const parsed = JSON.parse(rawCart);
      if (Array.isArray(parsed)) {
        setCartItems(parsed);
      }
    } catch (error) {
      console.error("Error parsing cart items:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const hasItems = cartItems.length > 0;

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Your Cart</h1>

      {!hasItems ? (
        <p>Your cart is empty! Go Start Shopping and Start Your Journey!</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <article
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: "1rem",
                alignItems: "center",
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: "0.75rem",
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{item.title}</h3>
                <p style={{ margin: "0.25rem 0 0 0" }}>
                  ${item.price.toFixed(2)} each
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  -
                </button>
                <span>Qty: {item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  +
                </button>
              </div>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </article>
          ))}
          <h2>Total: ${totalPrice.toFixed(2)}</h2>
        </>
      )}
    </main>
  );
};

export default Cart;