import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import GameCard from "../components/GameCard";
import { fetchAllGames, fetchAllCategories } from "../services/gamesService";
import "../styles/HomePage.css";
import "../styles/StorePage.css";

const Store = () => {
  const [searchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Filter state
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL query params into local filter state.
  useEffect(() => {
    const genreQuery = searchParams.get("genre");
    const genreFromUrl = genreQuery
      ? genreQuery
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : [];

    setSelectedGenres(genreFromUrl);
    setOnSaleOnly(searchParams.get("onSale") === "true");
  }, [searchParams]);

  // Fetch categories and games on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [categoriesData, gamesData] = await Promise.all([
          fetchAllCategories(),
          fetchAllGames(),
        ]);
        setCategories(categoriesData);
        setGames(gamesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle genre filter toggle
  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  // Handle price range input
  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    setMinPrice(value === "" ? "" : Math.max(0, parseFloat(value) || 0));
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    setMaxPrice(value === "" ? "" : Math.max(0, parseFloat(value) || 0));
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedGenres([]);
    setMinPrice("");
    setMaxPrice("");
    setOnSaleOnly(false);
  };

  // Apply filters to games
  const filtered = useMemo(() => {
    let list = games;

    // Filter by search query
    const q = (searchParams.get("q") ?? "").trim().toLowerCase();
    if (q) {
      list = list.filter((g) => g.title.toLowerCase().includes(q));
    }

    // Filter by selected genres
    if (selectedGenres.length > 0) {
      list = list.filter((g) =>
        selectedGenres.some((genre) =>
          (g.genres ?? [])
            .map((gg) => gg.toLowerCase())
            .includes(genre.toLowerCase()),
        ),
      );
    }

    // Filter by price range
    if (minPrice !== "") {
      list = list.filter((g) => g.price >= minPrice);
    }
    if (maxPrice !== "") {
      list = list.filter((g) => g.price <= maxPrice);
    }

    // Filter by on sale
    if (onSaleOnly) {
      list = list.filter((g) => g.onSale);
    }

    return list;
  }, [games, searchParams, selectedGenres, minPrice, maxPrice, onSaleOnly]);

  // Determine page heading
  const heading = searchParams.get("q")
    ? `Results for "${searchParams.get("q")?.trim()}"`
    : selectedGenres.length > 0 &&
        minPrice === "" &&
        maxPrice === "" &&
        !onSaleOnly
      ? `${selectedGenres.join(", ")} Games`
      : onSaleOnly &&
          selectedGenres.length === 0 &&
          minPrice === "" &&
          maxPrice === ""
        ? "Deals"
        : "All Games";

  const hasActiveFilters =
    selectedGenres.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "" ||
    onSaleOnly;

  return (
    <div className="home-page">
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{heading}</h2>
            <button
              className="toggle-filters-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="filter-panel">
              <div className="filter-section">
                <h3 className="filter-title">Genres</h3>
                <div className="genre-filters">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <label key={category.id} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(category.name)}
                          onChange={() => toggleGenre(category.name)}
                        />
                        <span>{category.name}</span>
                      </label>
                    ))
                  ) : (
                    <p style={{ color: "var(--color-text-secondary)" }}>
                      Loading genres…
                    </p>
                  )}
                </div>
              </div>

              <div className="filter-section">
                <h3 className="filter-title">Price Range</h3>
                <div className="price-filters">
                  <div className="price-input-group">
                    <label>Min Price</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      min="0"
                      step="0.01"
                      className="price-input"
                    />
                  </div>
                  <div className="price-input-group">
                    <label>Max Price</label>
                    <input
                      type="number"
                      placeholder="999"
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      min="0"
                      step="0.01"
                      className="price-input"
                    />
                  </div>
                </div>
              </div>

              <div className="filter-section">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => setOnSaleOnly(e.target.checked)}
                  />
                  <span>On Sale Only</span>
                </label>
              </div>

              {hasActiveFilters && (
                <button className="reset-filters-btn" onClick={resetFilters}>
                  Reset Filters
                </button>
              )}
            </div>
          )}

          {loading && (
            <p style={{ color: "var(--color-text-secondary)" }}>
              Loading games…
            </p>
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
              No games match your filters. Try adjusting your selections.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Store;
