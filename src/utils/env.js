export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== "undefined") {
    const isDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isDev) {
      return "http://localhost:3001/api";
    }
    return `${window.location.protocol}//${window.location.host}/api`;
  }

  return "http://localhost:3001/api";
};

export const API_URL = getApiUrl();
