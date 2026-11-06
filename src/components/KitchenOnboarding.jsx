import { useState } from "react";
import { getApiErrorMessage, registerKitchen } from "../api/ordersApi";

const DEFAULT_LOCATION = { lat: 22.7196, lng: 75.8577 };

/**
 * First-run onboarding for a kitchen partner (cloud kitchen or restaurant):
 * capture name, veg/non-veg, and location, then create the kitchen bound to
 * their account. On success the parent swaps in the real dashboard.
 */
function KitchenOnboarding({ onRegistered }) {
  const [name, setName] = useState("");
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
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
      setError("Give your kitchen a name.");
      return;
    }
    const loc = location || DEFAULT_LOCATION;
    setIsSaving(true);
    setError("");
    try {
      const kitchen = await registerKitchen({
        name: name.trim(),
        vegetarianOnly,
        latitude: loc.lat,
        longitude: loc.lng,
      });
      if (onRegistered) onRegistered(kitchen);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="panel">
      <div className="onboard-head">
        <span className="onboard-emoji">🏪</span>
        <div>
          <h2>Register your kitchen</h2>
          <p className="meta-line">
            List your kitchen or restaurant on the network. Tell us what you cook
            and where you are — customers' dishes get routed to you automatically.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="onboard-form">
        <div className="field">
          <label htmlFor="k-name">Kitchen name</label>
          <input
            id="k-name"
            className="ai-input"
            placeholder="e.g. Spice Route Kitchen"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={vegetarianOnly}
            onChange={(e) => setVegetarianOnly(e.target.checked)}
          />
          Pure vegetarian kitchen (only receive veg orders)
        </label>

        <div className="action-row">
          <button type="button" className="btn secondary" onClick={useMyLocation} disabled={locating}>
            {locating ? "Locating…" : location ? "📍 Location set" : "📍 Use my location"}
          </button>
          {location ? (
            <span className="meta-line">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          ) : (
            <span className="meta-line">Optional — defaults to city centre.</span>
          )}
        </div>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="action-row">
          <button type="submit" className="btn primary" disabled={isSaving}>
            {isSaving ? "Registering…" : "Create my kitchen"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default KitchenOnboarding;
