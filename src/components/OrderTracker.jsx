const STEPS = [
  { key: "KITCHEN_ASSIGNED", label: "Assigned" },
  { key: "COOKING", label: "Cooking" },
  { key: "READY", label: "Ready" },
  { key: "DELIVERED", label: "Delivered" },
];

/** Horizontal progress tracker for an order's live status. */
function OrderTracker({ status }) {
  if (status === "CANCELLED") {
    return <div className="tracker-cancelled">Order cancelled</div>;
  }

  const current = Math.max(0, STEPS.findIndex((s) => s.key === status));

  return (
    <div className="tracker">
      {STEPS.map((step, i) => {
        const state = i < current ? "done" : i === current ? "active" : "";
        return (
          <div className={`tracker-step ${state}`} key={step.key}>
            <span className="tracker-dot" />
            <span className="tracker-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default OrderTracker;
