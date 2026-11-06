import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  // Generous: Neon's free tier "scales to zero" when idle, so the first
  // request after a pause can take a few seconds to wake the database.
  timeout: 25000,
});

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const ORDER_STATUS = {
  CREATED: "CREATED",
  VALIDATED: "VALIDATED",
  KITCHEN_ASSIGNED: "KITCHEN_ASSIGNED",
  COOKING: "COOKING",
  READY: "READY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export async function createOrder(items) {
  const payload = { items };
  const response = await api.post(`/orders`, payload);
  return response.data;
}

export async function createCustomOrder(dish) {
  // dish is the AI ParsedDish (+ quantity); order-engine prices and routes it.
  const response = await api.post(`/orders/custom`, dish);
  return response.data;
}

export async function getCustomerOrders() {
  const response = await api.get(`/orders/customer`);
  return response.data;
}

export async function createPayment(orderId) {
  const response = await api.post(`/orders/${orderId}/pay`);
  return response.data;
}

export async function verifyPayment(orderId, payload) {
  const response = await api.post(`/orders/${orderId}/pay/verify`, payload);
  return response.data;
}

export async function getKitchenOrders(kitchenId) {
  const response = await api.get(`/orders/kitchen/${kitchenId}`);
  return response.data;
}

export async function updateOrderStatus(orderId, status) {
  const response = await api.patch(`/orders/${orderId}/status?status=${status}`);
  return response.data;
}

export async function cancelOrder(orderId) {
  const response = await api.patch(`/orders/${orderId}/cancel`);
  return response.data;
}

export async function rateOrder(orderId, rating, review) {
  const response = await api.patch(`/orders/${orderId}/rating`, { rating, review });
  return response.data;
}

export async function setFavorite(orderId, favorite) {
  const response = await api.patch(`/orders/${orderId}/favorite`, { favorite });
  return response.data;
}

export async function reorderOrder(orderId) {
  const response = await api.post(`/orders/${orderId}/reorder`);
  return response.data;
}

// ---- Catalog + kitchen inventory (Phase A: smart matching) ----

export async function getCatalog() {
  const response = await api.get(`/catalog/ingredients`);
  return response.data;
}

export async function getKitchens() {
  const response = await api.get(`/kitchens`);
  return response.data;
}

// Returns the signed-in partner's own kitchen, or null if they haven't registered one.
export async function getMyKitchen() {
  try {
    const response = await api.get(`/kitchens/mine`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
}

export async function registerKitchen(payload) {
  const response = await api.post(`/kitchens`, payload);
  return response.data;
}

export async function getKitchenStock(kitchenId) {
  const response = await api.get(`/kitchens/${kitchenId}/stock`);
  return response.data;
}

export async function updateKitchenStock(kitchenId, inStockIds) {
  const response = await api.put(`/kitchens/${kitchenId}/stock`, { inStockIds });
  return response.data;
}

export function getApiErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (typeof error?.response?.data === "string") {
    return error.response.data;
  }

  return "Something went wrong while talking to backend.";
}