import CTASection from "../components/CTASection";
import HeroSection from "../components/HeroSection";
import CategoryCard from "../components/CategoryCard";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";
import GameCard from "../components/GameCard";
import { fetchAllGames, fetchAllCategories } from "../services/gamesService";

const Home = () => {
  const [allGames, setAllGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllGames(), fetchAllCategories()])
      .then(([games, cats]) => {
        setAllGames(games);
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featuredGames = allGames.filter((g) => g.featured);
  const onSaleGames = allGames.filter((g) => g.onSale);

  return (
    <div className="home-page">
      {/* Hero Section: Main spotlight with Call to Action */}
      <HeroSection />

      {/* Loading state */}
      {loading && (
        <section className="section">
          <div className="container">
            <p style={{ color: "var(--color-text-secondary)" }}>Loading games…</p>
          </div>
        </section>
      )}

      {/* Featured Games Section: Displaying top picks */}
      {!loading && featuredGames.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Featured Games</h2>
              <Link to="/store" className="section-link">
                View All
              </Link>
            </div>
            <div className="games-grid">
              {featuredGames.map((game) => (
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
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Special Offers Section: Showcasing discounted titles */}
      {!loading && onSaleGames.length > 0 && (
        <section className="section sale-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                <span className="sale-badge">SALE</span>
                Special Offers
              </h2>
              <Link to="/store?onSale=true" className="section-link">
                View All Deals
              </Link>
            </div>
            <div className="games-grid">
              {onSaleGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section: Encouraging user registration */}
      <CTASection />
    </div>
  );
};

export default Home;
