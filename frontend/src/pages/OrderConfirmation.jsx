import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatDateTime, formatDate } from "../services/orderService";
import "../styles/OrderConfirmation.css";

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, session } = useAuth();

  // Get order from location state (passed from Checkout)
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="oc-root">
        <div className="oc-error">
          <h2>Order Not Found</h2>
          <p>We couldn't find your order. Please try placing a new order.</p>
          <button onClick={() => navigate("/store")} className="oc-btn-primary">
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="oc-root">
      <div className="oc-container">
        {/* Success Banner */}
        <div className="oc-success-banner">
          <div className="oc-success-icon">✓</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        {/* Order Details */}
        <div className="oc-card">
          <h2>Order Details</h2>
          <dl className="oc-details">
            <dt>Order ID:</dt>
            <dd className="oc-order-id">{order.id}</dd>

            <dt>Order Date:</dt>
            <dd>{formatDateTime(order.created_at)}</dd>

            <dt>Status:</dt>
            <dd className={`oc-status oc-status-${order.status}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </dd>

            <dt>Estimated Delivery:</dt>
            <dd>
              {order.estimated_delivery_date
                ? formatDate(order.estimated_delivery_date)
                : "N/A"}
            </dd>

            <dt>Total Amount:</dt>
            <dd className="oc-total">{formatCurrency(order.total_price)}</dd>
          </dl>
        </div>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="oc-card">
            <h2>Items in Your Order</h2>
            <div className="oc-items-list">
              {order.items.map((item) => (
                <div key={item.id} className="oc-item">
                  <div className="oc-item-info">
                    <div className="oc-item-id">Game ID: {item.steam_id}</div>
                    <div className="oc-item-quantity">Quantity: {item.quantity}</div>
                  </div>
                  <div className="oc-item-price">{formatCurrency(item.price)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="oc-card oc-next-steps">
          <h2>What's Next?</h2>
          <ul>
            <li>
              Check your email for an order confirmation and tracking information
            </li>
            <li>Your order is currently {order.status}</li>
            <li>
              You can track your order status anytime in your{" "}
              <button
                onClick={() => navigate("/orders")}
                className="oc-link-btn"
              >
                order history
              </button>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="oc-actions">
          <button onClick={() => navigate("/store")} className="oc-btn-secondary">
            Continue Shopping
          </button>
          <button onClick={() => navigate("/orders")} className="oc-btn-primary">
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
}
