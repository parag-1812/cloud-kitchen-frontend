export const MENU_CATALOG = [
  { ingredientId: 1, name: "Paneer", price: 100, prepTimeInMinutes: 5 },
  { ingredientId: 2, name: "Cheese", price: 100, prepTimeInMinutes: 5 },
];

export function getIngredientMeta(ingredientId) {
  return MENU_CATALOG.find((item) => item.ingredientId === ingredientId);
}
