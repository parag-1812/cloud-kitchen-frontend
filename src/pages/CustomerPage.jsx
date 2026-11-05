import { useState } from "react";
import AiDishBuilder from "../components/AiDishBuilder";
import CustomerOrders from "../components/CustomerOrders";

function CustomerPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="page-grid">
      <AiDishBuilder onOrderCreated={() => setRefreshKey((value) => value + 1)} />
      <CustomerOrders refreshKey={refreshKey} />
    </div>
  );
}

export default CustomerPage;
