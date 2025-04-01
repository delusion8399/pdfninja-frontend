const env = process.env.NODE_ENV;

const HOSTS = {
  development: "http://localhost:8000",
  production: "https://pdfninja-api.onrender.com",
  test: "https://pdfninja-api.onrender.com",
};

const API_HOST = HOSTS[env] || "https://pdfninja-api.onrender.com";

export const config = {
  apiBaseUrl: API_HOST,
};
