const hosts = {
  // development: "http://152.67.160.174:8000",
  development: "http://localhost:8000",
  // production: "https://pdfninja-backend.onrender.com",
  production: "http://152.67.160.174:8000",
};

export const config = {
  apiBaseUrl: hosts[process.env.NODE_ENV as keyof typeof hosts] || "http://localhost:8080",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};
