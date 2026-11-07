import { useEffect, useState } from "react";
import SupplierInventory from "../components/SupplierInventory";
import SupplierSourcingQueue from "../components/SupplierSourcingQueue";
import { getApiErrorMessage, getMySupplier, registerSupplier } from "../api/ordersApi";

const DEFAULT_LOCATION = { lat: 22.7196, lng: 75.8577 };

function SupplierOnboarding({ onRegistered }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocation(DEFAULT_LOCATION);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocation(DEFAULT_LOCATION);
        setLocating(false);
      },
      { timeout: 5000 }
    );
  }

  async function submit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Give your supply business a name.");
      return;
    }
    const loc = location || DEFAULT_LOCATION;
    setIsSaving(true);
    setError("");
    try {
      const supplier = await registerSupplier({
        name: name.trim(),
        latitude: loc.lat,
        longitude: loc.lng,
      });
      if (onRegistered) onRegistered(supplier);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="panel">
      <div className="onboard-head">
        <span className="onboard-emoji">📦</span>
        <div>
          <h2>Register as a supplier</h2>
          <p className="meta-line">
            Supply ingredients to the kitchen network. When a kitchen runs short,
            we route the sourcing request to the nearest supplier that carries it.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="onboard-form">
        <div className="field">
          <label htmlFor="s-name">Business name</label>
          <input
            id="s-name"
            className="ai-input"
            placeholder="e.g. FreshMart Wholesale"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="action-row">
          <button type="button" className="btn secondary" onClick={useMyLocation} disabled={locating}>
            {locating ? "Locating…" : location ? "📍 Location set" : "📍 Use my location"}
          </button>
          {location ? (
            <span className="meta-line">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          ) : (
            <span className="meta-line">Optional — defaults to city centre.</span>
          )}
        </div>

        {error ? <p className="error-text">{error}</p> : null}
        <div className="action-row">
          <button type="submit" className="btn primary" disabled={isSaving}>
            {isSaving ? "Registering…" : "Create supplier account"}
          </button>
        </div>
      </form>
    </section>
  );
}

function SupplierPage() {
  const [supplier, setSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("requests");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await getMySupplier();
        if (active) setSupplier(s);
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
        <section className="panel"><p className="meta-line">Loading…</p></section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-grid">
        <section className="panel"><p className="error-text">{error}</p></section>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="page-grid">
        <SupplierOnboarding onRegistered={(s) => setSupplier(s)} />
      </div>
    );
  }

  return (
    <div className="page-grid">
      <section className="panel compact">
        <div className="panel-header">
          <div>
            <h2>{supplier.name}</h2>
            <p className="meta-line">{supplier.stockCount} ingredients supplied · Supplier #{supplier.id}</p>
          </div>
        </div>
        <div className="seg">
          <button className={`seg-btn ${tab === "requests" ? "on" : ""}`} onClick={() => setTab("requests")}>
            Sourcing Requests
          </button>
          <button className={`seg-btn ${tab === "catalog" ? "on" : ""}`} onClick={() => setTab("catalog")}>
            What I Supply
          </button>
        </div>
      </section>
      {tab === "requests" ? (
        <SupplierSourcingQueue />
      ) : (
        <SupplierInventory supplierId={supplier.id} />
      )}
    </div>
  );
}

export default SupplierPage;
