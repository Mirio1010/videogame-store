import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Button from "./Button/Button";
import { useAuth } from "../context/AuthContext.jsx";
import { readCart } from "../utils/cartStorage";
import { fetchCart as fetchRemoteCart } from "../services/cartService";
import "../styles/websiteLogo.css";

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
          <span
            role="img"
            aria-label="cart"
            style={{ position: "relative", display: "inline-flex" }}
          >
            <img src="/cart.png" alt="Cart" className="cart-icon" />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  minWidth: 18,
                  height: 18,
                  padding: "0 5px",
                  borderRadius: 999,
                  background: "var(--color-error)",
                  color: "white",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  lineHeight: "18px",
                  textAlign: "center",
                }}
              >
                {cartCount}
              </span>
            )}
          </span>{" "}
          Cart
        </Button>
        {isAuthenticated && (
          <Button variant="secondary" onClick={() => navigate("/orders")}>
            My Orders
          </Button>
        )}
        {isAuthenticated ? (
          <>
            <Link
              to="/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--color-text-primary)",
                textDecoration: "none",
              }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile avatar"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid rgba(102,192,244,0.7)",
                  }}
                />
              ) : (
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "inline-grid",
                    placeItems: "center",
                    background: "var(--color-bg-medium)",
                    color: "var(--color-primary-light)",
                    fontWeight: 700,
                  }}
                >
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                {displayName}
              </span>
            </Link>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </>
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
