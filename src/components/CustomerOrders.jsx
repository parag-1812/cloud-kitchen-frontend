import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelOrder,
  getApiErrorMessage,
  getCustomerOrders,
  ORDER_STATUS,
} from "../api/ordersApi";

const cancellableStatuses = new Set([
  ORDER_STATUS.CREATED,
  ORDER_STATUS.VALIDATED,
  ORDER_STATUS.KITCHEN_ASSIGNED,
]);

function CustomerOrders({ customerId, refreshKey }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeCancelOrderId, setActiveCancelOrderId] = useState(null);

  const hasValidCustomerId = Number.isInteger(customerId) && customerId > 0;

  const loadOrders = useCallback(async () => {
    if (!hasValidCustomerId) {
      setOrders([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const result = await getCustomerOrders(customerId);
      setOrders(result);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [customerId, hasValidCustomerId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders, refreshKey]);

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

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => b.orderId - a.orderId);
  }, [orders]);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>My Orders</h2>
        <button
          className="btn secondary"
          onClick={loadOrders}
          disabled={isLoading || !hasValidCustomerId}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!hasValidCustomerId ? (
        <p className="meta-line">Enter a valid customer ID to fetch orders.</p>
      ) : null}

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

      {!isLoading && hasValidCustomerId && sortedOrders.length === 0 ? (
        <p className="meta-line">No orders found for customer #{customerId}.</p>
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
              <span>Kitchen #{order.kitchenId}</span>
              <span>Rs. {order.totalPrice?.toFixed?.(2) ?? order.totalPrice}</span>
              <span>{order.totalPrepTime} min</span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ingredient ID</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Prep Time</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => (
                    <tr key={`${order.orderId}-${index}`}>
                      <td>{item.ingredientId}</td>
                      <td>{item.quantity}</td>
                      <td>Rs. {item.priceAtOrderTime}</td>
                      <td>{item.prepTimeAtOrderTime} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
