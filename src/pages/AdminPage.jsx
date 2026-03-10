import { useEffect, useState } from "react";
import { getStats, getAllOrders } from "../api/adminApi";

function AdminPage() {

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0
  });

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {

    const statsData = await getStats();
    const ordersData = await getAllOrders();

    setStats(statsData);
    setOrders(ordersData);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Admin Dashboard</h2>

      <p>Total Orders: {stats.totalOrders}</p>
      <p>Total Revenue: Rs. {stats.totalRevenue}</p>

      <h3>All Orders</h3>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Price</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o.orderId}>
              <td>{o.orderId}</td>
              <td>{o.customerId}</td>
              <td>{o.status}</td>
              <td>Rs. {o.totalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPage;
