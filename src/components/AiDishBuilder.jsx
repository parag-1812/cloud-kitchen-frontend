import { useEffect, useState } from "react";
import { getAiErrorMessage, parseDish } from "../api/aiApi";
import { createCustomOrder } from "../api/ordersApi";
import { getApiErrorMessage } from "../api/ordersApi";

const EXAMPLES = [
  "Boneless chicken in tomato gravy, medium spicy, extra garlic, less oil",
  "Spicy paneer with extra coriander, homemade style",
  "Jain veg hakka noodles, no onion no garlic, dry",
];

// Fallback delivery location (city centre) used if the browser denies geolocation,
// so nearest-kitchen routing still works in the demo.
const DEFAULT_LOCATION = { lat: 22.7196, lng: 75.8577 };

// One-tap AI transforms applied to the current dish.
const TRANSFORMS = [
  { label: "🥗 Healthier", instr: "make it a healthier version: less oil, grilled or steamed, no cream" },
  { label: "🌱 Make vegan", instr: "make it fully vegan: no meat, egg, paneer, or dairy" },
  { label: "💪 High protein", instr: "make it a high-protein version" },
];

function Detail({ label, value }) {
  return (
    <div className="dish-detail">
      <span className="dish-detail-label">{label}</span>
      <span className="dish-detail-value">{value || "—"}</span>
    </div>
  );
}

function TagRow({ label, tags }) {
  return (
    <div className="dish-tagrow">
      <span className="dish-detail-label">{label}</span>
      <div className="catalog-row">
        {tags.map((tag) => (
          <span className="pill" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function AiDishBuilder({ onOrderCreated }) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [dish, setDish] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [location, setLocation] = useState(null);
  const [builtText, setBuiltText] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation(null),
        { timeout: 5000 }
      );
    }
  }, []);

  async function buildFromText(sourceText) {
    const t = (sourceText || "").trim();
    if (!t) {
      setError("Describe the dish you want.");
      return;
    }
    setError("");
    setDish(null);
    setPlaced(null);
    setIsLoading(true);
    try {
      const result = await parseDish(t);
      setDish(result);
      setBuiltText(t);
      setQuantity(1);
    } catch (err) {
      setError(getAiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  function handleBuild(event) {
    event.preventDefault();
    buildFromText(text);
  }

  function applyTransform(instr) {
    const nt = `${builtText}. Now ${instr}.`;
    setText(nt);
    buildFromText(nt);
  }

  async function handlePlaceOrder() {
    setError("");
    setIsPlacing(true);
    try {
      const loc = location || DEFAULT_LOCATION;
      const result = await createCustomOrder({
        ...dish,
        quantity: Number(quantity) || 1,
        customerLat: loc.lat,
        customerLng: loc.lng,
      });
      setPlaced(result);
      setDish(null);
      setText("");
      if (onOrderCreated) onOrderCreated();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsPlacing(false);
    }
  }

  const isNonVeg = dish?.dishType === "NON_VEG";

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{"✨"} Build a dish with AI</h2>
      </div>

      <form onSubmit={handleBuild}>
        <div className="field">
          <label htmlFor="dish-text">Describe your dish in your own words</label>
          <textarea
            id="dish-text"
            className="ai-input"
            rows={3}
            value={text}
            placeholder="e.g. boneless chicken in tomato gravy, medium spicy, extra garlic, less oil"
            onChange={(event) => setText(event.target.value)}
          />
        </div>

        <div className="hint-box">
          <p>Try one of these:</p>
          <div className="catalog-row">
            {EXAMPLES.map((example) => (
              <button
                type="button"
                key={example}
                className="pill ai-example"
                onClick={() => setText(example)}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="action-row">
          <button type="submit" className="btn primary" disabled={isLoading}>
            {isLoading ? "Thinking…" : "✨ Build with AI"}
          </button>
        </div>
      </form>

      {error ? <p className="error-text">{error}</p> : null}

      {placed ? (
        <div className="success-box">
          <p>
            ✅ Order <strong>#{placed.orderId}</strong> placed — routed to your nearest kitchen:{" "}
            <strong>{placed.kitchenName || `Kitchen #${placed.kitchenId}`}</strong>
            {placed.distanceKm != null ? ` · ${placed.distanceKm} km away` : ""}.
          </p>
          <p>
            Total: <strong>Rs. {placed.totalPrice}</strong> · Prep time: {placed.totalPrepTime} min · Status: {placed.status}
          </p>
        </div>
      ) : null}

      {dish ? (
        <div className="dish-card">
          <div className="order-head">
            <h3>{dish.summary || "Your custom dish"}</h3>
            <span className={`badge ${isNonVeg ? "status-cancelled" : "status-delivered"}`}>
              {isNonVeg ? "NON-VEG" : "VEG"}
            </span>
          </div>

          <div className="dish-grid">
            {dish.protein ? <Detail label="Protein" value={dish.protein} /> : null}
            <Detail label="Cooking style" value={dish.cookingStyle} />
            <Detail label="Spice" value={dish.spiceLevel} />
            <Detail label="Oil" value={dish.oilLevel} />
          </div>

          {dish.ingredients?.length ? (
            <TagRow label="Ingredients" tags={dish.ingredients} />
          ) : null}
          {dish.dietaryTags?.length ? (
            <TagRow label="Dietary" tags={dish.dietaryTags} />
          ) : null}
          {dish.specialInstructions ? (
            <p className="meta-line">
              <strong>Special instructions:</strong> {dish.specialInstructions}
            </p>
          ) : null}

          <div className="dish-tagrow">
            <span className="dish-detail-label">Tweak with AI</span>
            <div className="catalog-row">
              {TRANSFORMS.map((t) => (
                <button
                  type="button"
                  key={t.label}
                  className="pill ai-example"
                  disabled={isLoading}
                  onClick={() => applyTransform(t.instr)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {dish.nutrition ? (
            <div className="nutri-row">
              <div className="nutri-tile">
                <span className="nutri-value">{dish.nutrition.calories}</span>
                <span className="nutri-label">kcal</span>
              </div>
              <div className="nutri-tile">
                <span className="nutri-value">{dish.nutrition.proteinGrams}g</span>
                <span className="nutri-label">Protein</span>
              </div>
              <div className="nutri-tile">
                <span className="nutri-value">{dish.nutrition.carbsGrams}g</span>
                <span className="nutri-label">Carbs</span>
              </div>
              <div className="nutri-tile">
                <span className="nutri-value">{dish.nutrition.fatGrams}g</span>
                <span className="nutri-label">Fat</span>
              </div>
            </div>
          ) : null}

          {dish.suggestions?.length ? (
            <div className="dish-tagrow">
              <span className="dish-detail-label">You might also like</span>
              <div className="catalog-row">
                {dish.suggestions.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className="pill ai-example"
                    onClick={() => {
                      setText(s);
                      setDish(null);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="action-row">
            <div className="field" style={{ maxWidth: "120px" }}>
              <label htmlFor="dish-qty">Quantity</label>
              <input
                id="dish-qty"
                className="ai-input"
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>
          </div>
          <div className="action-row">
            <button className="btn primary" onClick={handlePlaceOrder} disabled={isPlacing}>
              {isPlacing ? "Placing…" : "🛒 Place this order"}
            </button>
            <button className="btn ghost" onClick={() => setDish(null)} disabled={isPlacing}>
              Discard
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AiDishBuilder;
