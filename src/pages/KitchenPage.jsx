import { useEffect, useState } from "react";
import KitchenDashboard from "../components/KitchenDashboard";
import KitchenInventory from "../components/KitchenInventory";
import KitchenOnboarding from "../components/KitchenOnboarding";
import EarningsTiles from "../components/EarningsTiles";
import { getApiErrorMessage, getKitchenEarnings, getMyKitchen } from "../api/ordersApi";

const rs = (n) => `Rs. ${Number(n || 0).toFixed(0)}`;

function KitchenPage() {
  const [myKitchen, setMyKitchen] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("queue");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const k = await getMyKitchen();
        if (active) setMyKitchen(k);
        if (k) {
          const e = await getKitchenEarnings();
          if (active) setEarnings(e);
        }
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
        {earnings ? (
          <EarningsTiles
            tiles={[
              { label: "Orders", value: earnings.orders },
              { label: "Gross", value: rs(earnings.gross) },
              { label: "Platform fee", value: rs(earnings.commission) },
              { label: "Your payout", value: rs(earnings.payout), accent: true },
            ]}
          />
        ) : null}
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
