// Utility to ensure Google Maps JavaScript API is available before usage
// Provides: waitForGoogleMaps(timeout) -> Promise
// Adds resilience with polling & script injection fallback.

let cachedPromise = null;

export function waitForGoogleMaps(timeout = 15000, pollInterval = 200) {
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }
  if (cachedPromise) return cachedPromise;

  cachedPromise = new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - start > timeout) {
        clearInterval(timer);
        reject(new Error("Google Maps API gagal dimuat dalam batas waktu."));
      }
    }, pollInterval);

    // Fallback: if script tag missing, attempt to inject (will only work if key not restricted)
    const hasScript = Array.from(document.getElementsByTagName("script")).some(
      (s) => s.src.includes("maps.googleapis.com/maps/api/js")
    );
    if (!hasScript) {
      const script = document.createElement("script");
      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!key) {
        console.warn(
          "Google Maps API key (VITE_GOOGLE_MAPS_API_KEY) tidak ditemukan di env."
        );
      }
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        key || ""
      }&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onerror = () =>
        console.warn("Gagal memuat script Google Maps (fallback).");
      document.head.appendChild(script);
    }
  });

  return cachedPromise;
}

export function isGoogleMapsReady() {
  return !!(window.google && window.google.maps);
}
