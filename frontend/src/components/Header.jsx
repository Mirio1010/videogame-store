import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "./Button/Button";
import "../styles/websiteLogo.css";

const Header = () => {
  // Simulated auth state (replace with context or real auth later)
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleLogin = () => {
    navigate("/login");
  };

  const handleCart = () => {
    navigate("/cart");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic or navigation here
    alert(`Searching for: ${search}`);
  };

  return (
    <header
      style={{
        background: "var(--gradient-header)",
        padding: "0.5rem 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "var(--shadow-md)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
        }}
      >
        <span
          className="logo-icon"
          style={{
            fontWeight: 700,
            fontSize: "2rem",
            color: "var(--color-primary)",
            marginLeft: "10px",
          }}
        >
          Pixel Pit Stop
        </span>
      </Link>
      <form
        onSubmit={handleSearch}
        style={{ flex: 1, maxWidth: 400, margin: "0 2rem" }}
      >
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem 1rem",
            borderRadius: 4,
            border: "none",
            fontSize: "1rem",
            background: "var(--color-bg-medium)",
            color: "var(--color-text-primary)",
          }}
        />
      </form>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginRight: "1.5rem",
        }}
      >
        <Button variant="secondary" onClick={handleCart}>
          <span role="img" aria-label="cart">
            <img src="/cart.png" alt="Cart" className="cart-icon" />
          </span>{" "}
          Cart
        </Button>
        {user ? (
          <span style={{ color: "var(--color-text-primary)" }}>
            {user.email}
          </span>
        ) : (
          <Button variant="primary" onClick={handleLogin}>
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};
export default Header;
