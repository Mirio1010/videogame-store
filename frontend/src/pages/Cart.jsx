//added the add to cart 
//added checkout page (doesn't show anything have a probelm with it)
//cart is updated makes the items removed, updated, and added to cart
//in the future will add a notifcation when a user clicks add to cart it will have a notifcation saying
//"added game to cart"
import { useEffect, useMemo, useState } from "react";
//used useNavigate to navigate to the checkout page
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { readCart, writeCart } from "../utils/cartStorage";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setCartItems(readCart(user));
  }, [user]);

  useEffect(() => {
    writeCart(user, cartItems);
    //updated cart when user adds something in the cart
    window.dispatchEvent(new Event("cart-updated"));
  }, [cartItems, user]);

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

  const handleCheckout = () => {
    navigate("/checkout");
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
          <button
            type="button"
            onClick={handleCheckout}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.25rem",
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            Checkout
          </button>
        </>
      )}
    </main>
  );
};

export default Cart;