'use client'

import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/HomePage.css';

/**
 * HomePage Component
 * * The main landing page featuring hero section, featured games,
 * categories, and special offers.
 */
const Home = () => {
  // Mock Data: Featured games for the top shelf
  const featuredGames = [
    { id: 1, title: 'Cyberpunk 2077', price: 59.99, image: 'https://placehold.co/300x400/1b2838/c7d5e0?text=Cyberpunk+2077' },
    { id: 2, title: 'Elden Ring', price: 69.99, image: 'https://placehold.co/300x400/1b2838/c7d5e0?text=Elden+Ring' },
    { id: 3, title: 'Hades II', price: 29.99, image: 'https://placehold.co/300x400/1b2838/c7d5e0?text=Hades+II' },
    { id: 4, title: 'Stray', price: 19.99, image: 'https://placehold.co/300x400/1b2838/c7d5e0?text=Stray' },
  ];

  // Mock Data: Games currently on sale
  const onSaleGames = [
    { id: 5, title: 'The Witcher 3', price: 39.99, discount: 75, image: 'https://placehold.co/300x400/1b2838/c7d5e0?text=Witcher+3' },
    { id: 6, title: 'Red Dead Redemption 2', price: 59.99, discount: 60, image: 'https://placehold.co/300x400/1b2838/c7d5e0?text=RDR2' },
  ];

  // Mock Data: Game categories
  const categories = [
    { id: 1, name: 'Action', slug: 'action' },
    { id: 2, name: 'RPG', slug: 'rpg' },
    { id: 3, name: 'Strategy', slug: 'strategy' },
    { id: 4, name: 'Indie', slug: 'indie' },
  ];

  /**
   * Placeholder Component: GameCard
   * Inline definition to ensure the template renders without missing dependencies.
   */
  const GameCard = ({ game }) => (
      <div className="game-card">
        <div className="game-card-image">
          <img src={game.image} alt={game.title} />
          {game.discount && <span className="discount-badge">-{game.discount}%</span>}
        </div>
        <div className="game-card-info">
          <h3>{game.title}</h3>
          <p className="game-card-price">${game.price}</p>
        </div>
      </div>
  );

  return (
      <div className="home-page">
        {/* Hero Section: Main spotlight with Call to Action */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">Welcome to Pixel Pit Stop</h1>
              <p className="hero-subtitle">
                Your ultimate destination for digital video games.
                Discover thousands of titles across all genres.
              </p>
              <div className="hero-actions">
                <Link to="/store" className="hero-btn primary">Browse Store</Link>
                <Link to="/store?onSale=true" className="hero-btn secondary">View Deals</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Games Section: Displaying top picks */}
        {featuredGames.length > 0 && (
            <section className="section">
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">Featured Games</h2>
                  <Link to="/store" className="section-link">View All</Link>
                </div>
                <div className="games-grid">
                  {featuredGames.map(game => (
                      <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </div>
            </section>
        )}

        {/* Categories Section: Filter games by genre */}
        {categories.length > 0 && (
            <section className="section categories-section">
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">Browse by Category</h2>
                </div>
                <div className="categories-grid">
                  {categories.map(category => (
                      <Link
                          key={category.id}
                          to={`/category/${category.slug}`}
                          className="category-card"
                      >
                        <span className="category-name">{category.name}</span>
                      </Link>
                  ))}
                </div>
              </div>
            </section>
        )}

        {/* Special Offers Section: Showcasing discounted titles */}
        {onSaleGames.length > 0 && (
            <section className="section sale-section">
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">
                    <span className="sale-badge">SALE</span>
                    Special Offers
                  </h2>
                  <Link to="/store?onSale=true" className="section-link">View All Deals</Link>
                </div>
                <div className="games-grid">
                  {onSaleGames.map(game => (
                      <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </div>
            </section>
        )}

        {/* CTA Section: Encouraging user registration */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Start Your Gaming Journey?</h2>
              <p>Create a free account and get access to exclusive deals and your personal game library.</p>
              <Link to="/register" className="cta-btn">Create Free Account</Link>
            </div>
          </div>
        </section>
      </div>
  );
}

export default Home;