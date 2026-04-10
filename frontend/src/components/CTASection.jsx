import React from "react";
import { Link } from "react-router-dom";

const CTASection = () => (
  <section className="cta-section">
    <div className="container">
      <div className="cta-content">
        <h2>Ready to Start Your Gaming Journey?</h2>
        <p>
          Create a free account and get access to exclusive deals and your
          personal game library.
        </p>
        <Link to="/register" className="cta-btn">
          Create Free Account
        </Link>
      </div>
    </div>
  </section>
);

export default CTASection;
