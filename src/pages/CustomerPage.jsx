import { useState } from "react";
import AiDishBuilder from "../components/AiDishBuilder";
import CreateOrder from "../components/CreateOrder";
import CustomerOrders from "../components/CustomerOrders";

function CustomerPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="page-grid">
      <section className="panel compact">
        <div className="panel-header">
          <h2>Customer Context</h2>
        </div>
        <p className="meta-line">
          Customer identity is resolved from the logged-in user&apos;s JWT.
        </p>
      </section>

      <AiDishBuilder />

      <CreateOrder onOrderCreated={() => setRefreshKey((value) => value + 1)} />
      <CustomerOrders refreshKey={refreshKey} />
    </div>
  );
}

export default CustomerPage;
