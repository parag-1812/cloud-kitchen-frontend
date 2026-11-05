import { useEffect, useState } from "react";
import { getStats, getAllOrders } from "../api/adminApi";

function AdminPage() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchData() {
    setIsLoading(true);
    setError("");
    try {
      const [statsData, ordersData] = await Promise.all([getStats(), getAllOrders()]);
      setStats(statsData);
      setOrders(ordersData);
    } catch (err) {
      setError("Could not load admin data. Is order-engine running?");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const sorted = [...orders].sort((a, b) => b.orderId - a.orderId);

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="panel-header">
          <h2>Overview</h2>
          <button className="btn secondary" onClick={fetchData} disabled={isLoading}>
            {isLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="stat-grid">
          <div className="stat-tile">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats.totalOrders}</span>
          </div>
          <div className="stat-tile accent">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">Rs. {Number(stats.totalRevenue || 0).toFixed(2)}</span>
          </div>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>All Orders</h2>
        </div>

        {!isLoading && sorted.length === 0 ? (
          <p className="meta-line">No orders yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Dish</th>
                  <th>Customer</th>
                  <th>Kitchen</th>
                  <th>Status</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((o) => (
                  <tr key={o.orderId}>
                    <td>#{o.orderId}</td>
                    <td>{o.dishSummary || `${o.items?.length ?? 0} item(s)`}</td>
                    <td>#{o.customerId}</td>
                    <td>#{o.kitchenId}</td>
                    <td>
                      <span className={`badge status-${o.status?.toLowerCase()}`}>{o.status}</span>
                    </td>
                    <td>Rs. {Number(o.totalPrice || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminPage;
