//added a notification where the user click on add to cart and it pops out "Added to cart"
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { addGameToCart } from "../utils/cartStorage";

const GameCard = ({ game }) => {
  const { user } = useAuth();
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  useEffect(() => {
    if (!showAddedMessage) return undefined;

    const timeoutId = setTimeout(() => {
      setShowAddedMessage(false);
    }, 1800);

    return () => clearTimeout(timeoutId);
  }, [showAddedMessage]);

  const addToCart = () => {
    addGameToCart(user, game);
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
