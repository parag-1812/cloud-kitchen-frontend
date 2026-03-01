import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 10000,
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

export async function getCustomerOrders() {
  const response = await api.get(`/orders/customer`);
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

export function getApiErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (typeof error?.response?.data === "string") {
    return error.response.data;
  }
  return "Something went wrong while talking to backend.";
}
