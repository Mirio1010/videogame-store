//added the add to cart 
//added checkout page (doesn't show anything have a probelm with it)
//cart is updated makes the items removed, updated, and added to cart
//in the future will add a notifcation when a user clicks add to cart it will have a notifcation saying
//"added game to cart"
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { readCart, writeCart } from "../utils/cartStorage";
import "../styles/CartPage.css";

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

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
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
    <main className="cart-page container">
      <header className="cart-header">
        <h1 className="cart-title">Your Cart</h1>
      </header>

      {!hasItems ? (
        <section className="cart-empty-state">
          <p>Your cart is empty! Go start shopping and start your journey!</p>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items-panel">
            {cartItems.map((item) => (
              <article key={item.id} className="cart-item">
                <div className="cart-item-media">
                  <img src={item.image} alt={item.title} className="cart-item-image" />
                </div>
                <div className="cart-item-info">
                  <h3>{item.title}</h3>
                  <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                  <p className="cart-item-subtotal">
                    Subtotal: ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-quantity-controls">
                    <button
                      type="button"
                      className="cart-quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="cart-quantity-label">Qty: {item.quantity}</span>
                    <button
                      type="button"
                      className="cart-quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </section>

          <aside className="cart-summary-panel">
            <p className="cart-summary-eyebrow">Order Summary</p>
            <h2 className="cart-total">${totalPrice.toFixed(2)}</h2>
            <div className="cart-summary-rows">
              <p className="cart-summary-row">
                <span>Total Games</span>
                <span>{totalItems}</span>
              </p>
              <p className="cart-summary-row">
                <span>Unique Copies</span>
                <span>{cartItems.length}</span>
              </p>
              <p className="cart-summary-row">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="cart-checkout-btn"
            >
              Proceed to Checkout
            </button>
          </aside>
        </div>
      )}
    </main>
  );
};

export default Cart;