/** Star rating — clickable when onChange is provided, display-only otherwise. */
function StarRating({ value = 0, onChange }) {
  const readOnly = !onChange;
  return (
    <div className={`stars ${readOnly ? "readonly" : ""}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`star ${s <= value ? "on" : ""}`}
          onClick={readOnly ? undefined : () => onChange(s)}
          disabled={readOnly}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default StarRating;
