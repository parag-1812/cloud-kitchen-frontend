import { useState } from "react";
import { getAiErrorMessage, parseDish } from "../api/aiApi";

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

function AiDishBuilder() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [dish, setDish] = useState(null);

  async function handleBuild(event) {
    event.preventDefault();
    if (!text.trim()) {
      setError("Describe the dish you want.");
      return;
    }
    setError("");
    setDish(null);
    setIsLoading(true);
    try {
      const result = await parseDish(text.trim());
      setDish(result);
    } catch (err) {
      setError(getAiErrorMessage(err));
    } finally {
      setIsLoading(false);
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
        </div>
      ) : null}
    </section>
  );
}

export default AiDishBuilder;
