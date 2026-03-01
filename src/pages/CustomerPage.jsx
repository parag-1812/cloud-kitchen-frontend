import { useState } from "react";
import CreateOrder from "../components/CreateOrder";
import CustomerOrders from "../components/CustomerOrders";

function CustomerPage() {
  const [customerIdInput, setCustomerIdInput] = useState("101");
  const [refreshKey, setRefreshKey] = useState(0);
  const customerId = Number(customerIdInput);

  return (
    <div className="page-grid">
      <section className="panel compact">
        <div className="panel-header">
          <h2>Customer Context</h2>
        </div>
        <div className="field">
          <label htmlFor="customer-id">Customer ID</label>
          <input
            id="customer-id"
            type="number"
            min="1"
            value={customerIdInput}
            onChange={(event) => setCustomerIdInput(event.target.value)}
          />
        </div>
      </section>

      <CreateOrder
        customerId={customerId}
        onOrderCreated={() => setRefreshKey((value) => value + 1)}
      />
      <CustomerOrders customerId={customerId} refreshKey={refreshKey} />
    </div>
  );
}

export default CustomerPage;
