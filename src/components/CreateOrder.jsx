import { useMemo, useState } from "react";
import {
  createOrder,
  getApiErrorMessage,
  ORDER_STATUS,
} from "../api/ordersApi";
import { getIngredientMeta, MENU_CATALOG } from "../constants/menuCatalog";

function emptyItem() {
  return { ingredientId: "", quantity: 1 };
}

function CreateOrder({ customerId, onOrderCreated }) {
  const [items, setItems] = useState([emptyItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdSummary, setCreatedSummary] = useState(null);

  const estimatedAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const ingredientId = Number(item.ingredientId);
      const quantity = Number(item.quantity);
      const ingredient = getIngredientMeta(ingredientId);
      if (!ingredient || !Number.isFinite(quantity) || quantity <= 0) {
        return sum;
      }
      return sum + ingredient.price * quantity;
    }, 0);
  }, [items]);

  function updateItem(index, key, value) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function validateItems() {
    if (!Number.isInteger(customerId) || customerId <= 0) {
      return "Please enter a valid customer ID.";
    }
    if (!items.length) {
      return "Add at least one item.";
    }
    const hasInvalid = items.some((item) => {
      const ingredientId = Number(item.ingredientId);
      const quantity = Number(item.quantity);
      return (
        !Number.isInteger(ingredientId) ||
        ingredientId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      );
    });
    if (hasInvalid) {
      return "Ingredient ID and quantity must be positive whole numbers.";
    }
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    const validationError = validateItems();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    const normalizedItems = items.map((item) => ({
      ingredientId: Number(item.ingredientId),
      quantity: Number(item.quantity),
    }));

    setIsSubmitting(true);
    try {
      const result = await createOrder(customerId, normalizedItems);
      setCreatedSummary(result);
      setItems([emptyItem()]);
      onOrderCreated();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Create Order</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="hint-box">
          <p>Available ingredients (from `data.sql` seed):</p>
          <div className="catalog-row">
            {MENU_CATALOG.map((ingredient) => (
              <span className="pill" key={ingredient.ingredientId}>
                #{ingredient.ingredientId} {ingredient.name}
              </span>
            ))}
          </div>
        </div>

        <div className="form-grid">
          {items.map((item, index) => (
            <div className="item-row" key={`item-${index}`}>
              <div className="field">
                <label htmlFor={`ingredient-${index}`}>Ingredient ID</label>
                <input
                  id={`ingredient-${index}`}
                  type="number"
                  min="1"
                  value={item.ingredientId}
                  onChange={(event) =>
                    updateItem(index, "ingredientId", event.target.value)
                  }
                  placeholder="e.g. 1"
                />
              </div>
              <div className="field">
                <label htmlFor={`quantity-${index}`}>Quantity</label>
                <input
                  id={`quantity-${index}`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(index, "quantity", event.target.value)
                  }
                  placeholder="e.g. 2"
                />
              </div>
              <button
                type="button"
                className="btn ghost"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="action-row">
          <button type="button" className="btn secondary" onClick={addItem}>
            Add Item
          </button>
          <button type="submit" className="btn primary" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </button>
        </div>
      </form>

      <p className="meta-line">
        Estimated amount: <strong>Rs. {estimatedAmount.toFixed(2)}</strong>
      </p>

      {submitError ? <p className="error-text">{submitError}</p> : null}
      {createdSummary ? (
        <div className="success-box">
          <p>Order created and assigned to kitchen #{createdSummary.kitchenId}.</p>
          <p>
            Status: <strong>{createdSummary.status || ORDER_STATUS.CREATED}</strong>
          </p>
          <p>
            Total: Rs. {createdSummary.totalPrice} | Prep time:{" "}
            {createdSummary.totalPrepTime} min
          </p>
        </div>
      ) : null}
    </section>
  );
}

export default CreateOrder;
