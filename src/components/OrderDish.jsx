import { foodEmoji } from "../utils/foodEmoji";

function Chip({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <span className="chip">
      <span className="chip-k">{label}</span>
      {value}
    </span>
  );
}

/**
 * Renders the contents of an order. For custom AI dishes it shows the parsed
 * dish (veg/non-veg marker, protein/style/spice/oil chips, ingredient pills,
 * special instructions). For legacy ingredient-id orders it shows the item table.
 */
/**
 * Shows how well the assigned kitchen covers the dish from its own stock.
 * 100% = everything in-house; otherwise the gap is flagged as "to source".
 */
function MatchSignal({ order }) {
  if (order.matchScore === null || order.matchScore === undefined) return null;
  const full = order.matchScore >= 100;
  const missing = order.missingItems || [];
  const subs = order.substitutions || [];
  return (
    <>
      <div className="match-row">
        <span className={`match-badge ${full ? "full" : "partial"}`}>
          {full ? "✓ Fully available at this kitchen" : `${order.matchScore}% in-house`}
        </span>
        {subs.length ? (
          <span className="match-swap">🔄 {subs.join(", ")}</span>
        ) : null}
        {!full && missing.length ? (
          <span className="match-source">To source: {missing.join(", ")}</span>
        ) : null}
      </div>
      {order.sourcingStatus ? (
        <div className="match-row">
          <span className={`sourcing-badge s-${order.sourcingStatus.toLowerCase()}`}>
            📦 {order.sourcingStatus === "UNFULFILLED"
              ? "No supplier found for the missing items"
              : `Sourcing ${missing.join(", ")} from ${order.sourcingSupplierName} · ${order.sourcingStatus}`}
          </span>
        </div>
      ) : null}
    </>
  );
}

function OrderDish({ order }) {
  const isCustom = Boolean(order.dishSummary || order.dishType);

  if (isCustom) {
    const nonVeg = order.dishType === "NON_VEG";
    return (
      <div className="dish-block">
        <div className="dish-title">
          <span className="dish-emoji small">{foodEmoji(order)}</span>
          <p className="dish-summary">{order.dishSummary || "Custom dish"}</p>
        </div>

        <div className="chip-row">
          <span
            className={`veg-dot ${nonVeg ? "nonveg" : "veg"}`}
            title={nonVeg ? "Non-vegetarian" : "Vegetarian"}
          />
          <Chip label="Protein" value={order.protein} />
          <Chip label="Style" value={order.cookingStyle} />
          <Chip label="Spice" value={order.spiceLevel} />
          <Chip label="Oil" value={order.oilLevel} />
          {order.quantity ? <Chip label="Qty" value={order.quantity} /> : null}
        </div>

        {order.ingredients?.length ? (
          <div className="catalog-row">
            {order.ingredients.map((ing) => (
              <span className="pill" key={ing}>
                {ing}
              </span>
            ))}
          </div>
        ) : null}

        {order.specialInstructions ? (
          <p className="meta-line">
            <strong>Note:</strong> {order.specialInstructions}
          </p>
        ) : null}

        <MatchSignal order={order} />
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ingredient ID</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Prep Time</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, index) => (
            <tr key={`${order.orderId}-${index}`}>
              <td>{item.ingredientId}</td>
              <td>{item.quantity}</td>
              <td>Rs. {item.priceAtOrderTime}</td>
              <td>{item.prepTimeAtOrderTime} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderDish;
