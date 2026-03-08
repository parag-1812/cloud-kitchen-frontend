import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080"
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