import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Button from "./Button/Button";
import { useAuth } from "../context/AuthContext.jsx";
import { readCart } from "../utils/cartStorage";
import { fetchCart as fetchRemoteCart } from "../services/cartService";
import "../styles/websiteLogo.css";
import "../styles/Header.css";
import { RiGameFill } from "react-icons/ri";

const Header = () => {
  const { user, session, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location=useLocation();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const displayName =
    user?.displayName ||
    user?.userMetadata?.nickname ||
    user?.userMetadata?.name ||
    user?.email ||
    "User";

  const syncCartCount = useCallback(async () => {
    try {
      if (user?.id && session?.access_token) {
        const response = await fetchRemoteCart(session.access_token);
        setCartCount(response.items?.length || 0);
        return;
      }

      const cart = readCart(user);
      setCartCount(cart.length);
    } catch (error) {
      console.error("Failed to sync cart count:", error);
    }
  }, [session, user]);

  useEffect(() => {
    const handleCartSync = () => {
      void syncCartCount();
    };

    const initialSyncTimer = window.setTimeout(handleCartSync, 0);
    window.addEventListener("storage", handleCartSync);
    window.addEventListener("cart-updated", handleCartSync);

    return () => {
      window.clearTimeout(initialSyncTimer);
      window.removeEventListener("storage", handleCartSync);
      window.removeEventListener("cart-updated", handleCartSync);
    };
  }, [syncCartCount]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCart = () => {
    navigate("/cart");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic or navigation here
    const trimmed = search.trim();
    const params = new URLSearchParams();
    if (location.pathname === "/store" && searchParams.get("onSale") === "true") {
      params.set("onSale", "true");
    }
    if (trimmed) params.set("q", trimmed);
    const qs = params.toString();
    navigate({ pathname: "/store", search: qs ? `?${qs}` : "" });
  };

  return (
    <header className="site-header">
      <Link to="/" className="site-logo">
        <span className="site-logo-mark">
          <RiGameFill className="site-logo-icon" />
        </span>
        <span className="site-logo-text">Pixel Pit Stop</span>
      </Link>

      <form onSubmit={handleSearch} className="site-search-form">
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="site-search-input"
        />
      </form>

      <div className="site-header-actions">
        <button className="header-cart-btn" onClick={handleCart}>
          <span className="cart-icon-wrapper">
            <img src="/cart.png" alt="Cart" className="cart-icon" />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </span>
          <span>Cart</span>
        </button>

        {isAuthenticated && (
          <button
            className="header-nav-btn"
            onClick={() => navigate("/orders")}
          >
            My Orders
          </button>
        )}

        {user?.role === "admin" && (
          <button className="header-nav-btn" onClick={() => navigate("/admin")}>
            Admin
          </button>
        )}

        {isAuthenticated ? (
          <>
            <Link to="/profile" className="profile-link">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile avatar"
                  className="profile-avatar"
                />
              ) : (
                <span className="profile-initial">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
              )}

              <span className="profile-name">{displayName}</span>
            </Link>

            <button className="header-nav-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="header-signin-btn" onClick={handleLogin}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
export default Header;
