import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelOrder,
  createPayment,
  getApiErrorMessage,
  getCustomerOrders,
  ORDER_STATUS,
  verifyPayment,
} from "../api/ordersApi";
import OrderDish from "./OrderDish";
import OrderTracker from "./OrderTracker";

const cancellableStatuses = new Set([
  ORDER_STATUS.CREATED,
  ORDER_STATUS.VALIDATED,
  ORDER_STATUS.KITCHEN_ASSIGNED,
]);

function CustomerOrders({ refreshKey }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeCancelOrderId, setActiveCancelOrderId] = useState(null);
  const [payingId, setPayingId] = useState(null);

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setErrorMessage("");
    try {
      const result = await getCustomerOrders();
      setOrders(result);
    } catch (error) {
      if (!silent) setErrorMessage(getApiErrorMessage(error));
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders, refreshKey]);

  // Live updates: silently re-poll every 5s so status changes appear automatically.
  useEffect(() => {
    const id = setInterval(() => loadOrders(true), 5000);
    return () => clearInterval(id);
  }, [loadOrders]);

  async function handleCancel(orderId) {
    setActiveCancelOrderId(orderId);
    setErrorMessage("");
    try {
      await cancelOrder(orderId);
      await loadOrders();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setActiveCancelOrderId(null);
    }
  }

  async function handlePay(order) {
    setErrorMessage("");
    setPayingId(order.orderId);
    try {
      const p = await createPayment(order.orderId);
      if (!window.Razorpay) {
        setErrorMessage("Payment library didn't load. Check your connection and refresh.");
        setPayingId(null);
        return;
      }
      const rzp = new window.Razorpay({
        key: p.keyId,
        amount: p.amountPaise,
        currency: p.currency,
        order_id: p.razorpayOrderId,
        name: "Cloud Kitchen",
        description: `Order #${order.orderId}`,
        theme: { color: "#f9a826" },
        modal: { ondismiss: () => setPayingId(null) },
        handler: async (resp) => {
          try {
            await verifyPayment(order.orderId, {
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            });
            await loadOrders();
          } catch (err) {
            setErrorMessage(getApiErrorMessage(err));
          } finally {
            setPayingId(null);
          }
        },
      });
      rzp.on("payment.failed", () => {
        setErrorMessage("Payment failed. Please try again.");
        setPayingId(null);
      });
      rzp.open();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
      setPayingId(null);
    }
  }

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => b.orderId - a.orderId);
  }, [orders]);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>My Orders</h2>
        <button
          className="btn secondary"
          onClick={() => loadOrders()}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

      {!isLoading && sortedOrders.length === 0 ? (
        <p className="meta-line">No orders found for the authenticated customer.</p>
      ) : null}

      <div className="order-list">
        {sortedOrders.map((order) => (
          <article className="order-card" key={order.orderId}>
            <div className="order-head">
              <h3>Order #{order.orderId}</h3>
              <span className={`badge status-${order.status?.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            <div className="order-meta">
              <span>
                {order.kitchenName || `Kitchen #${order.kitchenId}`}
                {order.distanceKm != null ? ` · ${order.distanceKm} km` : ""}
              </span>
              <span>Rs. {order.totalPrice?.toFixed?.(2) ?? order.totalPrice}</span>
              <span>{order.totalPrepTime} min</span>
            </div>

            <OrderTracker status={order.status} />

            <OrderDish order={order} />

            <div className="action-row">
              {order.paymentStatus === "PAID" ? (
                <span className="badge status-delivered">✅ Paid</span>
              ) : order.status !== ORDER_STATUS.CANCELLED ? (
                <button
                  className="btn primary"
                  onClick={() => handlePay(order)}
                  disabled={payingId === order.orderId}
                >
                  {payingId === order.orderId
                    ? "Opening…"
                    : `Pay Rs. ${order.totalPrice?.toFixed?.(2) ?? order.totalPrice}`}
                </button>
              ) : null}
            </div>

            {cancellableStatuses.has(order.status) ? (
              <div className="action-row">
                <button
                  className="btn danger"
                  onClick={() => handleCancel(order.orderId)}
                  disabled={activeCancelOrderId === order.orderId}
                >
                  {activeCancelOrderId === order.orderId
                    ? "Cancelling..."
                    : "Cancel Order"}
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default CustomerOrders;
