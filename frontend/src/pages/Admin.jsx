import { useEffect, useMemo, useState } from "react";

import {
  createAdminGame,
  deleteAdminGame,
  fetchAdminGames,
  updateAdminGame,
} from "../services/gamesService";
import "../styles/HomePage.css";
import "../styles/AdminPage.css";

const emptyForm = {
  steamId: "",
  price: "",
  originalPrice: "",
  discount: 0,
  featured: false,
  active: true,
};

function Admin() {
  const [games, setGames] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingSteamId, setEditingSteamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const managedCount = games.length;
  const activeCount = useMemo(
    () => games.filter((entry) => entry.active !== false).length,
    [games],
  );
  const featuredCount = useMemo(
    () => games.filter((entry) => entry.featured).length,
    [games],
  );

  const loadGames = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminGames();
      setGames(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGames();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingSteamId(null);
  };

  const editGame = (entry) => {
    setEditingSteamId(entry.steamId);
    setForm({
      steamId: String(entry.steamId),
      price: String(entry.price),
      originalPrice: String(entry.originalPrice),
      discount: entry.discount,
      featured: entry.featured,
      active: entry.active !== false,
    });
    setSuccess("");
    setError("");
  };

  const submitGame = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      steamId: Number(form.steamId),
      price: Number(form.price),
      originalPrice:
        form.originalPrice === "" ? Number(form.price) : Number(form.originalPrice),
      discount: Number(form.discount),
      featured: form.featured,
      active: form.active,
    };

    try {
      if (editingSteamId) {
        await updateAdminGame(editingSteamId, payload);
        setSuccess("Game updated.");
      } else {
        await createAdminGame(payload);
        setSuccess("Game added to the store.");
      }
      resetForm();
      await loadGames();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeGame = async (steamId) => {
    setError("");
    setSuccess("");

    try {
      await deleteAdminGame(steamId);
      setSuccess("Game removed from admin catalog.");
      if (editingSteamId === steamId) resetForm();
      await loadGames();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="home-page admin-page">
      <section className="section">
        <div className="container">
          <div className="admin-header">
            <div>
              <p className="admin-kicker">Admin Catalog</p>
              <h2 className="section-title">Product Management</h2>
            </div>
            <div className="admin-stats">
              <div className="admin-stat">
                <span>{managedCount}</span>
                <p>Managed</p>
              </div>
              <div className="admin-stat">
                <span>{activeCount}</span>
                <p>Active</p>
              </div>
              <div className="admin-stat">
                <span>{featuredCount}</span>
                <p>Featured</p>
              </div>
            </div>
          </div>

          <div className="admin-layout">
            <form className="admin-panel admin-form" onSubmit={submitGame}>
              <div className="admin-panel-header">
                <h3>{editingSteamId ? "Edit Game" : "Add Game"}</h3>
                {editingSteamId && (
                  <button type="button" className="admin-link-btn" onClick={resetForm}>
                    Clear
                  </button>
                )}
              </div>

              <label className="admin-field">
                <span>Steam App ID</span>
                <input
                  type="number"
                  min="1"
                  value={form.steamId}
                  disabled={Boolean(editingSteamId)}
                  onChange={(event) => updateField("steamId", event.target.value)}
                  required
                />
              </label>

              <div className="admin-field-row">
                <label className="admin-field">
                  <span>Price</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => updateField("price", event.target.value)}
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Original Price</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.originalPrice}
                    onChange={(event) => updateField("originalPrice", event.target.value)}
                    placeholder={form.price || "0.00"}
                  />
                </label>
              </div>

              <label className="admin-field">
                <span>Discount Percent</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount}
                  onChange={(event) => updateField("discount", event.target.value)}
                />
              </label>

              <div className="admin-toggles">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) => updateField("featured", event.target.checked)}
                  />
                  <span>Feature on home page</span>
                </label>
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) => updateField("active", event.target.checked)}
                  />
                  <span>Visible in store</span>
                </label>
              </div>

              {error && <p className="admin-message error">{error}</p>}
              {success && <p className="admin-message success">{success}</p>}

              <button type="submit" className="admin-submit-btn" disabled={saving}>
                {saving ? "Saving..." : editingSteamId ? "Update Game" : "Add Game"}
              </button>
            </form>

            <div className="admin-panel admin-list-panel">
              <div className="admin-panel-header">
                <h3>Managed Games</h3>
                <button type="button" className="admin-link-btn" onClick={loadGames}>
                  Refresh
                </button>
              </div>

              {loading && (
                <p className="admin-empty">Loading managed games...</p>
              )}

              {!loading && games.length === 0 && (
                <p className="admin-empty">
                  Add a Steam App ID to start managing store products.
                </p>
              )}

              {!loading && games.length > 0 && (
                <div className="admin-game-list">
                  {games.map((entry) => (
                    <article className="admin-game-row" key={entry.steamId}>
                      <img
                        src={entry.game?.image}
                        alt={entry.game?.title || `Steam app ${entry.steamId}`}
                      />
                      <div className="admin-game-meta">
                        <h4>{entry.game?.title || `Steam App ${entry.steamId}`}</h4>
                        <p>Steam ID {entry.steamId}</p>
                        <div className="admin-badges">
                          <span>${entry.price.toFixed(2)}</span>
                          {entry.discount > 0 && <span>{entry.discount}% off</span>}
                          {entry.featured && <span>Featured</span>}
                          <span>{entry.active === false ? "Hidden" : "Active"}</span>
                        </div>
                      </div>
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => editGame(entry)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => removeGame(entry.steamId)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Admin;
