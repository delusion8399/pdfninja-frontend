const hosts = {
  development: "http://localhost:8000",
  // production: "https://pdfninja-backend-docker.onrender.com",
  production: "https://pdfninja-backend-delusion83991164-rdszuug4.leapcell.dev",
};

export const config = {
  apiBaseUrl: hosts[process.env.NODE_ENV as keyof typeof hosts] || "http://localhost:8080",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};
