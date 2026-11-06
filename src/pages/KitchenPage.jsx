import { useState } from "react";
import KitchenDashboard from "../components/KitchenDashboard";
import KitchenInventory from "../components/KitchenInventory";

function KitchenPage() {
  const [kitchenIdInput, setKitchenIdInput] = useState("1");
  const [tab, setTab] = useState("queue");
  const kitchenId = Number(kitchenIdInput);

  return (
    <div className="page-grid">
      <section className="panel compact">
        <div className="panel-header">
          <h2>Kitchen Context</h2>
        </div>
        <div className="field">
          <label htmlFor="kitchen-id">Kitchen ID</label>
          <input
            id="kitchen-id"
            type="number"
            min="1"
            value={kitchenIdInput}
            onChange={(event) => setKitchenIdInput(event.target.value)}
          />
        </div>
        <div className="seg">
          <button
            className={`seg-btn ${tab === "queue" ? "on" : ""}`}
            onClick={() => setTab("queue")}
          >
            Order Queue
          </button>
          <button
            className={`seg-btn ${tab === "inventory" ? "on" : ""}`}
            onClick={() => setTab("inventory")}
          >
            Inventory
          </button>
        </div>
      </section>
      {tab === "queue" ? (
        <KitchenDashboard kitchenId={kitchenId} />
      ) : (
        <KitchenInventory kitchenId={kitchenId} />
      )}
    </div>
  );
}

export default KitchenPage;
