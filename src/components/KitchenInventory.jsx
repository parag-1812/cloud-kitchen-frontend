import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getApiErrorMessage,
  getCatalog,
  getKitchenStock,
  updateKitchenStock,
} from "../api/ordersApi";

/**
 * A kitchen's stock checklist. Instead of gram-level accounting (which small
 * kitchens never keep accurate), the kitchen simply ticks which canonical
 * ingredients it stocks. This drives the platform's coverage-based routing.
 */
function KitchenInventory({ kitchenId }) {
  const [catalog, setCatalog] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(null);

  const hasValidKitchenId = Number.isInteger(kitchenId) && kitchenId > 0;

  const load = useCallback(async () => {
    if (!hasValidKitchenId) return;
    setIsLoading(true);
    setError("");
    try {
      const [cat, stock] = await Promise.all([
        getCatalog(),
        getKitchenStock(kitchenId),
      ]);
      setCatalog(cat);
      setSelected(new Set(stock.inStockIds || []));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [hasValidKitchenId, kitchenId]);

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
      await updateKitchenStock(kitchenId, Array.from(selected));
      setSavedAt(Date.now());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  if (!hasValidKitchenId) return null;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Inventory</h2>
          <p className="meta-line">
            Tick what you stock. Orders are routed to the kitchen that can cover
            the most of a customer's dish.
          </p>
        </div>
        <button className="btn primary" onClick={save} disabled={isLoading || isSaving}>
          {isSaving ? "Saving…" : "Save inventory"}
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {savedAt ? <p className="success-inline">✓ Inventory saved</p> : null}
      {isLoading ? <p className="meta-line">Loading catalog…</p> : null}

      <p className="meta-line">
        <strong>{selected.size}</strong> of {catalog.length} ingredients in stock
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
                  title={dietaryTitle(item)}
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

function dietaryTitle(item) {
  const tags = [];
  if (item.vegan) tags.push("vegan");
  if (item.containsDairy) tags.push("dairy");
  if (item.containsGluten) tags.push("gluten");
  if (item.containsNuts) tags.push("nuts");
  if (item.highProtein) tags.push("high-protein");
  return tags.length ? tags.join(" · ") : item.name;
}

export default KitchenInventory;
