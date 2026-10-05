export const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://career-rise-api.onrender.com/api/v1"
    : "http://localhost:3001/api/v1");
