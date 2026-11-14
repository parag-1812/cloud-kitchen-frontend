import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
});

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};

export const getAllOrders = async () => {
  const res = await api.get("/admin/orders");
  return res.data;
};

export const getKitchenDirectory = async () => {
  const res = await api.get("/admin/kitchens/directory");
  return res.data;
};

export const getSupplierDirectory = async () => {
  const res = await api.get("/admin/suppliers/directory");
  return res.data;
};

export const getCustomerDirectory = async () => {
  const res = await api.get("/admin/customers/directory");
  return res.data;
};
