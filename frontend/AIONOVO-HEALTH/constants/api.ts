const fallbackApiUrl = "https://replace-this-with-your-render-url.onrender.com";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || fallbackApiUrl;

export function getPredictUrl() {
  return `${API_BASE_URL.replace(/\/+$/, "")}/predict`;
}
