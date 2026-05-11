import React from "react";
import "../styles/websiteLogo.css"
const HeroSection = () => (
  <section className="hero-section">
    <div className="website-logo-wrap">
      <img className="website-logo" src="/PixelPitStopLogo.svg" alt="website logo" />
    </div>
    <div className="container">
      <div className="hero-content">
        <h1 className="hero-title">Welcome to Pixel Pit Stop</h1>
        <p className="hero-subtitle">
          Your ultimate destination for digital video games. Discover thousands
          of titles across all genres.
        </p>
        <div className="hero-actions">
          {/* Links will be passed as children or replaced in Home.jsx */}
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
