//added a notification where the user click on add to cart and it pops out "Added to cart"
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { addGameToCart } from "../utils/cartStorage";

const GameCard = ({ game }) => {
  const { user } = useAuth();
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const discountValue = Number(game.discount) || 0;

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
      <Link to={`/game/${game.id}`} className="game-card-link">
        <div className="game-card-image">
          <img src={game.image} alt={game.title} />
          {discountValue > 0 && (
            <span className="discount-badge">-{discountValue}%</span>
          )}
        </div>
        <div className="game-card-info">
          <h3>{game.title}</h3>
          <p className="game-card-price">${game.price}</p>
        </div>
      </Link>

      <button type="button" onClick={addToCart} className="game-card-add-btn">
        Add to cart
      </button>
      {showAddedMessage && (
        <p className="game-card-added-msg">
          Added to cart!
        </p>
      )}
    </div>
  );
};

export default GameCard;
