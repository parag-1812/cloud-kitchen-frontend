import { useState } from "react";
import KitchenDashboard from "../components/KitchenDashboard";

function KitchenPage() {
  const [kitchenIdInput, setKitchenIdInput] = useState("1");
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
      </section>
      <KitchenDashboard kitchenId={kitchenId} />
    </div>
  );
}

export default KitchenPage;
