/** A compact row of money stat tiles (gross / commission / payout, etc.). */
function EarningsTiles({ tiles }) {
  if (!tiles?.length) return null;
  return (
    <div className="stat-grid earnings-grid">
      {tiles.map((t) => (
        <div className={`stat-tile ${t.accent ? "accent" : ""}`} key={t.label}>
          <span className="stat-label">{t.label}</span>
          <span className="stat-value">{t.value}</span>
        </div>
      ))}
    </div>
  );
}

export default EarningsTiles;
