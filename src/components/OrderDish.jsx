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
function OrderDish({ order }) {
  const isCustom = Boolean(order.dishSummary || order.dishType);

  if (isCustom) {
    const nonVeg = order.dishType === "NON_VEG";
    return (
      <div className="dish-block">
        {order.dishSummary ? <p className="dish-summary">{order.dishSummary}</p> : null}

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
