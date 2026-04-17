import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import GameCard from "../components/GameCard";
import featuredGames from "../data/featuredGames.json";
import onSaleGames from "../data/onSaleGames.json";
import "../Styles/HomePage.css";

function mergeCatalog() {
  const byId = new Map();
  [...featuredGames, ...onSaleGames].forEach((game) => {
    if (!byId.has(game.id)) byId.set(game.id, game);
  });
  return [...byId.values()];
}

const Store = () => {
  const [searchParams] = useSearchParams();
  const catalog = useMemo(() => mergeCatalog(), []);

  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const onSaleOnly = searchParams.get("onSale") === "true";

  const filtered = useMemo(() => {
    let list = catalog;
    if (onSaleOnly) {
      list = list.filter((g) => g.discount != null && Number(g.discount) > 0);
    }
    if (q) {
      list = list.filter((g) => g.title.toLowerCase().includes(q));
    }
    return list;
  }, [catalog, q, onSaleOnly]);

  const heading = q
    ? `Results for "${searchParams.get("q")?.trim()}"`
    : onSaleOnly
      ? "Deals"
      : "All games";

  return (
    <div className="home-page">
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{heading}</h2>
          </div>
          {filtered.length > 0 ? (
            <div className="games-grid">
              {filtered.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
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
