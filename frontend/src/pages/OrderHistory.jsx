import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrders, formatDate, formatDateTime, getStatusLabel, cancelOrder } from "../services/orderService";
import { fetchAllGames } from "../services/gamesService";
import "../styles/OrderHistory.css";

export default function OrderHistory() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [gameMap, setGameMap] = useState({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user || !session?.access_token) {
      navigate("/login");
    }
  }, [user, session, navigate]);

  // Fetch orders on mount
  useEffect(() => {
    if (session?.access_token) {
      fetchOrders();
    }
  }, [session?.access_token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const [response, games] = await Promise.all([
        getOrders(session.access_token),
        fetchAllGames().catch(() => []),
      ]);
      setOrders(response.orders || []);
      const map = {};
      (games || []).forEach((g) => { map[g.id] = g; });
      setGameMap(map);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setCancelling(orderId);
      await cancelOrder(orderId, session.access_token);
      // Refresh orders
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      setError(err.message || "Failed to cancel order");
    } finally {
      setCancelling(null);
    }
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getStatusBadgeClass = (status) => {
    return `oh-status-${status}`;
  };

  if (loading) {
    return <div className="oh-root"><div className="oh-loading">Loading your orders...</div></div>;
  }

  return (
    <div className="oh-root">
      <div className="oh-container">
        <h1>My Orders</h1>

        {error && <div className="oh-error">Error: {error}</div>}

        {orders.length === 0 ? (
          <div className="oh-empty">
            <p>You haven't placed any orders yet.</p>
            <button onClick={() => navigate("/store")} className="oh-btn-primary">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="oh-orders-list">
            {orders.map((order) => (
              <div key={order.id} className="oh-order-card">
                <div className="oh-order-header">
                  <div>
                    <div className="oh-order-id">Order ID: {order.id}</div>
                    <div className="oh-order-date">{formatDateTime(order.created_at)}</div>
                  </div>
                  <div className="oh-order-summary">
                    <span className={`oh-status ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="oh-total">{formatCurrency(order.total_price)}</span>
                  </div>
                </div>

                <div className="oh-order-body">
                  {order.estimated_delivery_date && (
                    <div className="oh-delivery-info">
                      <strong>Estimated Delivery:</strong> {formatDate(order.estimated_delivery_date)}
                    </div>
                  )}

                  <div className="oh-order-actions">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                      className="oh-btn-secondary"
                    >
                      {selectedOrder === order.id ? "Hide Details" : "View Details"}
                    </button>

                    {["pending", "confirmed"].includes(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancelling === order.id}
                        className="oh-btn-danger"
                      >
                        {cancelling === order.id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedOrder === order.id && order.items && (
                  <div className="oh-order-details">
                    <h3>Items in This Order</h3>
                    <div className="oh-items-list">
                      {order.items.map((item) => {
                        const game = gameMap[item.steam_id];
                        const thumbnail = game?.headerImage
                          ?? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${item.steam_id}/header.jpg`;
                        return (
                          <div key={item.id} className="oh-item">
                            <img
                              src={thumbnail}
                              alt={game?.title ?? `Game ${item.steam_id}`}
                              className="oh-item-thumbnail"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <div className="oh-item-info">
                              {game?.title && (
                                <div className="oh-item-title">{game.title}</div>
                              )}
                              <div className="oh-item-game-id">Game ID: {item.steam_id}</div>
                              <div className="oh-item-quantity">Qty: {item.quantity}</div>
                            </div>
                            <div className="oh-item-price">{formatCurrency(item.price)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {orders.length > 0 && (
          <div className="oh-footer">
            <button onClick={() => navigate("/store")} className="oh-btn-secondary">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
