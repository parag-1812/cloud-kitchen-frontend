import { useCallback, useEffect, useState } from "react";
import { advanceSourcing, getApiErrorMessage, getSupplierSourcing } from "../api/ordersApi";

const NEXT_ACTION = {
  REQUESTED: "Accept request",
  ACCEPTED: "Mark dispatched",
  DISPATCHED: "Mark delivered",
};

/** A supplier's incoming sourcing requests, with lifecycle controls. */
function SupplierSourcingQueue() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setRequests(await getSupplierSourcing());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function advance(id) {
    setBusyId(id);
    setError("");
    try {
      await advanceSourcing(id);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  const sorted = [...requests].sort((a, b) => b.id - a.id);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Sourcing Requests</h2>
        <button className="btn secondary" onClick={load} disabled={isLoading}>
          {isLoading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {!isLoading && sorted.length === 0 ? (
        <p className="meta-line">No sourcing requests yet. They appear when a kitchen is missing something you supply.</p>
      ) : null}

      <div className="order-list">
        {sorted.map((r) => {
          const action = NEXT_ACTION[r.status];
          return (
            <article className="order-card" key={r.id}>
              <div className="order-head">
                <h3>Request #{r.id} · Order #{r.orderId}</h3>
                <span className={`badge status-${r.status?.toLowerCase()}`}>{r.status}</span>
              </div>
              <p className="meta-line">Deliver to: <strong>{r.kitchenName || `Kitchen #${r.kitchenId}`}</strong></p>
              <div className="catalog-row">
                {r.items.map((it) => (
                  <span className="pill" key={it}>{it}</span>
                ))}
              </div>
              {action ? (
                <div className="action-row">
                  <button
                    className="btn primary"
                    onClick={() => advance(r.id)}
                    disabled={busyId === r.id}
                  >
                    {busyId === r.id ? "Updating…" : action}
                  </button>
                </div>
              ) : (
                <p className="success-inline">✓ Delivered</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default SupplierSourcingQueue;
