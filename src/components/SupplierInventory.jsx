import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getApiErrorMessage,
  getCatalog,
  getSupplierStock,
  updateSupplierStock,
} from "../api/ordersApi";

/** A supplier's stock checklist against the shared catalog (mirrors kitchen inventory). */
function SupplierInventory({ supplierId }) {
  const [catalog, setCatalog] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(null);

  const load = useCallback(async () => {
    if (!supplierId) return;
    setIsLoading(true);
    setError("");
    try {
      const [cat, stock] = await Promise.all([getCatalog(), getSupplierStock(supplierId)]);
      setCatalog(cat);
      setSelected(new Set(stock.inStockIds || []));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const byCategory = {};
    for (const item of catalog) {
      const key = item.category || "Other";
      (byCategory[key] = byCategory[key] || []).push(item);
    }
    return Object.entries(byCategory).sort((a, b) => a[0].localeCompare(b[0]));
  }, [catalog]);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSavedAt(null);
  }

  async function save() {
    setIsSaving(true);
    setError("");
    try {
      await updateSupplierStock(supplierId, Array.from(selected));
      setSavedAt(Date.now());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>What you supply</h2>
          <p className="meta-line">
            Tick the ingredients you carry. Kitchens missing these get their
            sourcing requests routed to you.
          </p>
        </div>
        <button className="btn primary" onClick={save} disabled={isLoading || isSaving}>
          {isSaving ? "Saving…" : "Save catalog"}
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {savedAt ? <p className="success-inline">✓ Saved</p> : null}
      <p className="meta-line">
        <strong>{selected.size}</strong> of {catalog.length} ingredients supplied
      </p>

      {grouped.map(([category, items]) => (
        <div className="inv-group" key={category}>
          <h4 className="inv-group-title">{category}</h4>
          <div className="inv-grid">
            {items.map((item) => {
              const on = selected.has(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`inv-chip ${on ? "on" : ""}`}
                  onClick={() => toggle(item.id)}
                >
                  <span className="inv-check">{on ? "✓" : "+"}</span>
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

export default SupplierInventory;
