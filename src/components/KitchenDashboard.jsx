import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getApiErrorMessage,
  getKitchenOrders,
  ORDER_STATUS,
  updateOrderStatus,
} from "../api/ordersApi";

const nextStatusAction = {
  [ORDER_STATUS.KITCHEN_ASSIGNED]: {
    label: "Start Cooking",
    nextStatus: ORDER_STATUS.COOKING,
  },
  [ORDER_STATUS.COOKING]: {
    label: "Mark Ready",
    nextStatus: ORDER_STATUS.READY,
  },
  [ORDER_STATUS.READY]: {
    label: "Mark Delivered",
    nextStatus: ORDER_STATUS.DELIVERED,
  },
};

function KitchenDashboard({ kitchenId }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeOrderId, setActiveOrderId] = useState(null);

  const hasValidKitchenId = Number.isInteger(kitchenId) && kitchenId > 0;

  const loadOrders = useCallback(async () => {
    if (!hasValidKitchenId) {
      setOrders([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const result = await getKitchenOrders(kitchenId);
      setOrders(result);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [hasValidKitchenId, kitchenId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function progressOrder(orderId, status) {
    const action = nextStatusAction[status];
    if (!action) {
      return;
    }
    setActiveOrderId(orderId);
    setErrorMessage("");
    try {
      await updateOrderStatus(orderId, action.nextStatus);
      await loadOrders();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setActiveOrderId(null);
    }
  }

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => b.orderId - a.orderId);
  }, [orders]);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Kitchen Queue</h2>
        <button
          className="btn secondary"
          onClick={loadOrders}
          disabled={isLoading || !hasValidKitchenId}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!hasValidKitchenId ? (
        <p className="meta-line">Enter a valid kitchen ID to load orders.</p>
      ) : null}

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

      {!isLoading && hasValidKitchenId && sortedOrders.length === 0 ? (
        <p className="meta-line">No active orders for kitchen #{kitchenId}.</p>
      ) : null}

      <div className="order-list">
        {sortedOrders.map((order) => {
          const action = nextStatusAction[order.status];

          return (
            <article className="order-card" key={order.orderId}>
              <div className="order-head">
                <h3>Order #{order.orderId}</h3>
                <span className={`badge status-${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-meta">
                <span>Customer #{order.customerId}</span>
                <span>Rs. {order.totalPrice?.toFixed?.(2) ?? order.totalPrice}</span>
                <span>{order.totalPrepTime} min</span>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ingredient ID</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
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

              {action ? (
                <div className="action-row">
                  <button
                    className="btn primary"
                    onClick={() => progressOrder(order.orderId, order.status)}
                    disabled={activeOrderId === order.orderId}
                  >
                    {activeOrderId === order.orderId
                      ? "Updating..."
                      : action.label}
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default KitchenDashboard;
