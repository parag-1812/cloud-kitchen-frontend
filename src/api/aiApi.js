import axios from "axios";

const AI_BASE_URL =
  import.meta.env.VITE_AI_BASE_URL || "http://localhost:8082";

const api = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 40000, // the model can take a few seconds to think
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function parseDish(text) {
  const response = await api.post("/ai/parse-dish", { text });
  return response.data;
}

export function getAiErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (typeof error?.response?.data === "string") {
    return error.response.data;
  }
  return "Could not reach the AI service. Is ai-recipe-service running on port 8082?";
}
