import React from "react";

const GameCard = ({ game }) => (
  <div className="game-card">
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
  </div>
);

export default GameCard;
