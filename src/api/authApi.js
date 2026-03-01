import axios from "axios";

const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:8081";

export async function login(username, password) {
  const response = await axios.post(`${AUTH_BASE_URL}/auth/login`, {
    username,
    password,
  });

  return response.data;
}

export async function signup(username, password, role) {
  const response = await axios.post(`${AUTH_BASE_URL}/auth/signup`, {
    username,
    password,
    role,
  });

  return response.data;
}