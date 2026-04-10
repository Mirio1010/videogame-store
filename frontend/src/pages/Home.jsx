import CTASection from "../components/CTASection";
import HeroSection from "../components/HeroSection";
import CategoryCard from "../components/CategoryCard";
("use client");

import React from "react";
import { Link } from "react-router-dom";
import "../Styles/HomePage.css";
import GameCard from "../components/GameCard";


/**
 * HomePage Component
 * * The main landing page featuring hero section, featured games,
 * categories, and special offers.
 */

  // Mock Data: Featured games for the top shelf
import featuredGames from "../data/featuredGames.json"

// Mock Data: Games currently on sale
import onSaleGames from "../data/onSaleGames.json"

// Mock Data: Game categories
import categories from "../data/categories.json";

const Home = () => {

  return (
    <div className="home-page">
      {/* Hero Section: Main spotlight with Call to Action */}
      <HeroSection />

      {/* Featured Games Section: Displaying top picks */}
      {featuredGames.length > 0 && (
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
      {onSaleGames.length > 0 && (
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
