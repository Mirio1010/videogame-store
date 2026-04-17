//added a notification where the user click on add to cart and it pops out "Added to cart"
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CART_STORAGE_KEY = "cart";

const GameCard = ({ game }) => {
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  useEffect(() => {
    if (!showAddedMessage) return undefined;

    const timeoutId = setTimeout(() => {
      setShowAddedMessage(false);
    }, 1800);

    return () => clearTimeout(timeoutId);
  }, [showAddedMessage]);

  const addToCart = () => {
    const rawCart = localStorage.getItem(CART_STORAGE_KEY);
    let cartItems = [];

    try {
      cartItems = rawCart ? JSON.parse(rawCart) : [];
    } catch (error) {
      console.error("Error reading cart items:", error);
    }

    const existingItem = cartItems.find((item) => item.id === game.id);

    if (existingItem) {
      const updatedCart = cartItems.map((item) =>
        item.id === game.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cart-updated"));
      setShowAddedMessage(true);
      return;
    }

    const newItem = {
      id: game.id,
      title: game.title,
      price: game.price,
      image: game.image,
      quantity: 1,
    };

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([...cartItems, newItem])
    );
    window.dispatchEvent(new Event("cart-updated"));
    setShowAddedMessage(true);
  };

  return (
    <div className="game-card">
      <Link
        to={`/game/${game.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="game-card-image">
          <img src={game.image} alt={game.title} />
          {game.discount && (
            <span className="discount-badge">-{game.discount}%</span>
          )}
        </div>
        <div className="game-card-info">
          <h3>{game.title}</h3>
          <p className="game-card-price">${game.price}</p>
        </div>
      </Link>

      <button
        type="button"
        onClick={addToCart}
        style={{ marginTop: "0.75rem", width: "100%" }}
      >
        Add to cart
      </button>
      {showAddedMessage && (
        <p
          style={{
            marginTop: "0.5rem",
            marginBottom: 0,
            color: "#00ff00",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          Added to cart!
        </p>
      )}
    </div>
  );
};

export default GameCard;
