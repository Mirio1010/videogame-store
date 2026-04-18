import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import GameCard from "../components/GameCard";
import { fetchAllGames } from "../services/gamesService";
import "../styles/HomePage.css";

const Store = () => {
  const [searchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllGames()
      .then(setGames)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const onSaleOnly = searchParams.get("onSale") === "true";

  const filtered = useMemo(() => {
    let list = games;
    if (onSaleOnly) {
      list = list.filter((g) => g.onSale);
    }
    if (q) {
      list = list.filter((g) => g.title.toLowerCase().includes(q));
    }
    return list;
  }, [games, q, onSaleOnly]);

  const heading = q
    ? `Results for "${searchParams.get("q")?.trim()}"`
    : onSaleOnly
      ? "Deals"
      : "All Games";

  return (
    <div className="home-page">
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{heading}</h2>
          </div>
          {loading && (
            <p style={{ color: "var(--color-text-secondary)" }}>Loading games…</p>
          )}
          {error && (
            <p style={{ color: "var(--color-error)" }}>
              Could not load games: {error}
            </p>
          )}
          {!loading && !error && filtered.length > 0 && (
            <div className="games-grid">
              {filtered.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p style={{ color: "var(--color-text-secondary)" }}>
              No games match your search. Try a different title.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Store;
