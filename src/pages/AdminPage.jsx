import { useEffect, useState } from "react";
import axios from "axios";

function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [count, setCount] = useState(0);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const ordersRes = await axios.get("http://localhost:8080/admin/orders", { headers });
    const revenueRes = await axios.get("http://localhost:8080/admin/revenue", { headers });
    const countRes = await axios.get("http://localhost:8080/admin/orders/count", { headers });

    setOrders(ordersRes.data);
    setRevenue(revenueRes.data);
    setCount(countRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Total Orders: {count}</p>
      <p>Total Revenue: ₹{revenue}</p>

      <h3>All Orders</h3>
      {orders.map(order => (
        <div key={order.orderId}>
          <p>Order #{order.orderId}</p>
          <p>Status: {order.status}</p>
          <p>Total: ₹{order.totalPrice}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default AdminPage;