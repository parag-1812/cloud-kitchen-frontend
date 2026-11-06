import { useEffect, useState } from "react";
import KitchenDashboard from "../components/KitchenDashboard";
import KitchenInventory from "../components/KitchenInventory";
import KitchenOnboarding from "../components/KitchenOnboarding";
import { getApiErrorMessage, getMyKitchen } from "../api/ordersApi";

function KitchenPage() {
  const [myKitchen, setMyKitchen] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("queue");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const k = await getMyKitchen();
        if (active) setMyKitchen(k);
      } catch (err) {
        if (active) setError(getApiErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="page-grid">
        <section className="panel">
          <p className="meta-line">Loading your kitchen…</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-grid">
        <section className="panel">
          <p className="error-text">{error}</p>
        </section>
      </div>
    );
  }

  if (!myKitchen) {
    return (
      <div className="page-grid">
        <KitchenOnboarding onRegistered={(k) => setMyKitchen(k)} />
      </div>
    );
  }

  return (
    <div className="page-grid">
      <section className="panel compact">
        <div className="panel-header">
          <div>
            <h2>{myKitchen.name}</h2>
            <p className="meta-line">
              {myKitchen.vegetarianOnly ? "Pure veg" : "Veg & non-veg"} ·{" "}
              {myKitchen.stockCount} ingredients in stock · Kitchen #{myKitchen.id}
            </p>
          </div>
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
        <KitchenDashboard kitchenId={myKitchen.id} />
      ) : (
        <KitchenInventory kitchenId={myKitchen.id} />
      )}
    </div>
  );
}

export default KitchenPage;
