import { useEffect, useRef, useState } from "react";

/**
 * Komponen peta PharmaHub
 * - Peta 1: Embed lokasi apotek (Fasilkom-TI USU) via iframe Google Maps
 * - Peta 2: Live tracking posisi pengguna menggunakan Geolocation API
 *
 * Catatan: Live tracking tidak memakai Google Maps API berbayar,
 * hanya menggunakan iframe + <div> peta HTML5 sederhana (Leaflet bisa ditambah nanti jika perlu).
 */
const PharmaHubMap = () => {
  const [trackingActive, setTrackingActive] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [position, setPosition] = useState(null);
  const watchIdRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Inisialisasi peta HTML sederhana untuk live tracking
  useEffect(() => {
    if (!mapRef.current) return;

    // Peta sangat sederhana: hanya kotak dengan titik biru di tengah yang digeser
    if (!markerRef.current) {
      const marker = document.createElement("div");
      marker.style.width = "16px";
      marker.style.height = "16px";
      marker.style.borderRadius = "999px";
      marker.style.backgroundColor = "#2563eb"; // biru
      marker.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.3)";
      marker.style.position = "absolute";
      marker.style.left = "50%";
      marker.style.top = "50%";
      marker.style.transform = "translate(-50%, -50%)";
      markerRef.current = marker;
      mapRef.current.style.position = "relative";
      mapRef.current.appendChild(marker);
    }
  }, []);

  // Handle start/stop tracking
  const toggleTracking = () => {
    if (trackingActive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
      setTrackingActive(false);
      setGeoError("");
      return;
    }

    if (!("geolocation" in navigator)) {
      setGeoError("Perangkat ini tidak mendukung pelacakan lokasi.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGeoError("");
      },
      (err) => {
        console.error("Geolocation error:", err);
        setGeoError(
          err.code === 1
            ? "Izin lokasi ditolak. Aktifkan izin lokasi browser untuk menggunakan live tracking."
            : "Gagal mendapatkan lokasi. Coba lagi."
        );
        setTrackingActive(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );

    watchIdRef.current = watchId;
    setTrackingActive(true);
  };

  const openInGoogleMaps = () => {
    const url =
      "https://www.google.com/maps/dir/?api=1&destination=Gedung+C+Fasilkom-TI+Universitas+Sumatera+Utara";
    window.open(url, "_blank");
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Lokasi Apotek</h2>
      <p className="text-gray-600 mb-6 max-w-2xl">
        Apotek PharmaHub berlokasi di <span className="font-semibold">Gedung C
        Fasilkom-TI, Universitas Sumatera Utara</span>. Gunakan peta di bawah ini
        untuk melihat lokasi dan mengaktifkan live tracking rute Anda.
      </p>

      {/* Peta lokasi apotek */}
      <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 mb-6">
        <iframe
          title="Lokasi Apotek PharmaHub"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.106215476306!2d98.654!3d3.563!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sFasilkom-TI%20USU%20Gedung%20C!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
          width="100%"
          height="320"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <button
          type="button"
          onClick={openInGoogleMaps}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700"
        >
          <i className="fas fa-location-arrow mr-2"></i>
          Buka Navigasi di Google Maps
        </button>
        <button
          type="button"
          onClick={toggleTracking}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold shadow border ${
            trackingActive
              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          }`}
        >
          <i
            className={`fas mr-2 ${
              trackingActive ? "fa-pause-circle" : "fa-play-circle"
            }`}
          ></i>
          {trackingActive
            ? "Matikan Live Tracking di Halaman Ini"
            : "Aktifkan Live Tracking di Halaman Ini"}
        </button>
      </div>

      {/* Peta live tracking sederhana */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Live Tracking Lokasi Anda
          </h3>
          {position && (
            <span className="text-xs text-gray-500">
              Akurasi 
              {position.accuracy ? `±${Math.round(position.accuracy)} m` : ""}
            </span>
          )}
        </div>
        <div
          ref={mapRef}
          className="relative w-full h-64 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden flex items-center justify-center"
        >
          {!trackingActive && (
            <p className="text-sm text-gray-500 text-center px-4">
              Aktifkan live tracking untuk melihat posisi Anda relatif terhadap
              lokasi apotek.
            </p>
          )}
        </div>
        {geoError && (
          <p className="mt-3 text-sm text-red-600">{geoError}</p>
        )}
        {trackingActive && !geoError && (
          <p className="mt-3 text-sm text-gray-600">
            Titik biru di tengah peta merepresentasikan posisi Anda. Untuk
            navigasi detail (belokan, jarak, estimasi waktu), gunakan tombol
            <span className="font-semibold"> "Buka Navigasi di Google Maps"</span>
            di atas.
          </p>
        )}
      </div>
    </section>
  );
};

export default PharmaHubMap;
