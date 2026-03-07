import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});



export const getAllOrders = async () => {
  const res = await api.get("/admin/orders");
  return res.data;
};