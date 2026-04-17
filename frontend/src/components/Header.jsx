import { Link, useNavigate,useLocation,useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "./Button/Button";
import "../styles/websiteLogo.css";

const CART_STORAGE_KEY = "cart";

const Header = () => {
  // Simulated auth state (replace with context or real auth later)
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location=useLocation();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const getCartCount = () => {
    const rawCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!rawCart) return 0;

    try {
      const parsed = JSON.parse(rawCart);
      if (!Array.isArray(parsed)) return 0;
      // Count unique items, not total quantity
      return parsed.length;
    } catch (error) {
      console.error("Error reading cart count:", error);
      return 0;
    }
  };

  useEffect(() => {
    const syncCartCount = () => {
      setCartCount(getCartCount());
    };

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener("cart-updated", syncCartCount);

    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("cart-updated", syncCartCount);
    };
  }, []);

  useEffect(()=>{
    if(location.pathname==="/store"){
      setSearch(searchParams.get("q") ?? "");
    }
  }, [location.pathname, searchParams]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleCart = () => {
    navigate("/cart");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic or navigation here
    const trimmed=search.trim();
    const params=new URLSearchParams();
    if (location.pathname === "/store" && searchParams.get("onSale") === "true") {
      params.set("onSale","true");
    }
    if(trimmed) params.set("q",trimmed);
    const qs=params.toString();
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
