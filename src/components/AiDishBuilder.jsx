import { useState } from "react";
import { getAiErrorMessage, parseDish } from "../api/aiApi";
import { createCustomOrder } from "../api/ordersApi";
import { getApiErrorMessage } from "../api/ordersApi";

const EXAMPLES = [
  "Boneless chicken in tomato gravy, medium spicy, extra garlic, less oil",
  "Spicy paneer with extra coriander, homemade style",
  "Jain veg hakka noodles, no onion no garlic, dry",
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

  async function handleBuild(event) {
    event.preventDefault();
    if (!text.trim()) {
      setError("Describe the dish you want.");
      return;
    }
    setError("");
    setDish(null);
    setPlaced(null);
    setIsLoading(true);
    try {
      const result = await parseDish(text.trim());
      setDish(result);
      setQuantity(1);
    } catch (err) {
      setError(getAiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePlaceOrder() {
    setError("");
    setIsPlacing(true);
    try {
      const result = await createCustomOrder({ ...dish, quantity: Number(quantity) || 1 });
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
            ✅ Order <strong>#{placed.orderId}</strong> placed and assigned to kitchen #{placed.kitchenId}.
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
