import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchGameById } from "../services/gamesService";
import { useAuth } from "../context/AuthContext.jsx";
import { addGameToCart } from "../utils/cartStorage";
import { addCartItem as addRemoteCartItem } from "../services/cartService";
import "../styles/GameDetailPage.css";

export default function GameDetailPage() {
  const { steamId } = useParams();
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeShot, setActiveShot] = useState(0);
  const [addedMsg, setAddedMsg] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      try {
        const gameData = await fetchGameById(Number(steamId));
        setGame(gameData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [steamId]);

  const handleAddToCart = async () => {
    try {
      if (user?.id && session?.access_token) {
        await addRemoteCartItem(session.access_token, game.id, 1);
      } else {
        addGameToCart(user, game);
      }

      window.dispatchEvent(new Event("cart-updated"));
      setAddedMsg(true);
      setTimeout(() => setAddedMsg(false), 1800);
    } catch (err) {
      setError(err.message || "Failed to add game to cart");
    }
  };

  if (loading) return <div className="gdp-state">Loading game details…</div>;
  if (error)   return <div className="gdp-state gdp-error">Error: {error}</div>;
  if (!game)   return <div className="gdp-state">Game not found.</div>;

  const hasDiscount = game.discount > 0;

  return (
    <div className="gdp-root">
      {/* ── Hero banner ── */}
      {game.headerImage && (
        <div className="gdp-hero" style={{ backgroundImage: `url(${game.headerImage})` }}>
          <div className="gdp-hero-overlay" />
        </div>
      )}

      <div className="gdp-body">
        {/* ── Back link ── */}
        <button className="gdp-back" onClick={() => navigate(-1)}>← Back</button>

        <div className="gdp-layout">
          {/* ── Left column ── */}
          <aside className="gdp-aside">
            <img className="gdp-cover" src={game.image} alt={game.title} />

            {/* Price / Add to cart */}
            <div className="gdp-purchase">
              {game.isFree ? (
                <span className="gdp-free">Free to Play</span>
              ) : (
                <div className="gdp-price-row">
                  {hasDiscount && (
                    <span className="gdp-discount-badge">-{game.discount}%</span>
                  )}
                  <div className="gdp-prices">
                    {hasDiscount && (
                      <span className="gdp-original">${game.originalPrice.toFixed(2)}</span>
                    )}
                    <span className="gdp-final">${game.price.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <button className="gdp-add-btn" onClick={handleAddToCart}>
                Add to Cart
              </button>
              {addedMsg && <p className="gdp-added">Added to cart!</p>}
            </div>

            {/* Meta info */}
            <dl className="gdp-meta">
              {game.developers.length > 0 && (
                <>
                  <dt>Developer</dt>
                  <dd>{game.developers.join(", ")}</dd>
                </>
              )}
              {game.publishers.length > 0 && (
                <>
                  <dt>Publisher</dt>
                  <dd>{game.publishers.join(", ")}</dd>
                </>
              )}
              {game.releaseDate && (
                <>
                  <dt>Release Date</dt>
                  <dd>{game.releaseDate}</dd>
                </>
              )}
              {game.genres.length > 0 && (
                <>
                  <dt>Genres</dt>
                  <dd>{game.genres.join(", ")}</dd>
                </>
              )}
            </dl>
          </aside>

          {/* ── Right column ── */}
          <main className="gdp-main">
            <h1 className="gdp-title">{game.title}</h1>

            {/* Review scores */}
            <div className="gdp-scores">
              {game.metacritic != null && (
                <div className="gdp-score-card gdp-metacritic">
                  <span className="gdp-score-num">{game.metacritic}</span>
                  <span className="gdp-score-label">Metacritic</span>
                </div>
              )}
              {game.reviews != null && (
                <div className="gdp-score-card gdp-reviews">
                  <span className="gdp-score-num">{game.reviews.toLocaleString()}</span>
                  <span className="gdp-score-label">Steam Reviews</span>
                </div>
              )}
            </div>

            {/* Description */}
            {game.description && (
              <p className="gdp-description">{game.description}</p>
            )}

            {/* Steam feature tags */}
            {game.categories.length > 0 && (
              <div className="gdp-tags">
                {game.categories.slice(0, 8).map((cat) => (
                  <span key={cat} className="gdp-tag">{cat}</span>
                ))}
              </div>
            )}

            {/* Screenshots */}
            {game.screenshots?.length > 0 && (
              <div className="gdp-screenshots">
                <h2 className="gdp-section-title">Screenshots</h2>
                <div className="gdp-shot-main">
                  <img
                    src={game.screenshots[activeShot].full}
                    alt={`Screenshot ${activeShot + 1}`}
                  />
                </div>
                <div className="gdp-thumbs">
                  {game.screenshots.map((shot, i) => (
                    <button
                      key={i}
                      className={`gdp-thumb${i === activeShot ? " gdp-thumb-active" : ""}`}
                      onClick={() => setActiveShot(i)}
                    >
                      <img src={shot.thumbnail} alt={`Thumb ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
