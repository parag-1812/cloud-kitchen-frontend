/** Pick an appetising emoji for a dish from its protein / summary. */
export function foodEmoji(dish = {}) {
  const p = (dish.protein || "").toLowerCase();
  const s = (dish.summary || dish.dishSummary || "").toLowerCase();
  const hay = `${p} ${s}`;

  if (hay.includes("chicken")) return "🍗";
  if (hay.includes("fish") || hay.includes("prawn")) return "🐟";
  if (hay.includes("mutton") || hay.includes("lamb")) return "🍖";
  if (hay.includes("egg")) return "🥚";
  if (hay.includes("pizza")) return "🍕";
  if (hay.includes("burger")) return "🍔";
  if (hay.includes("noodle") || hay.includes("hakka") || hay.includes("ramen")) return "🍜";
  if (hay.includes("biryani") || hay.includes("rice") || hay.includes("pulao")) return "🍚";
  if (hay.includes("paneer") || hay.includes("tofu") || hay.includes("soya")) return "🧀";
  if (dish.dishType === "NON_VEG") return "🍛";
  return "🥗";
}
