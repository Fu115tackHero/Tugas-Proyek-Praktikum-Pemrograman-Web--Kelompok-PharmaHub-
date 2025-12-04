import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  // --- STATE BARU UNTUK KEKUATAN PASSWORD ---
  const [passwordStrength, setPasswordStrength] = useState(0); // 0 - 4

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [policyModal, setPolicyModal] = useState({ open: false, type: null });

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  // --- FUNGSI CEK KEKUATAN PASSWORD (REGEX) ---
  const checkStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;

    if (pass.length >= 8) score += 1; // Cek Panjang
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1; // Cek Huruf Besar & Kecil
    if (/[0-9]/.test(pass)) score += 1; // Cek Angka
    if (/[^A-Za-z0-9]/.test(pass)) score += 1; // Cek Simbol unik

    return score;
  };

  // --- FUNGSI GET LABEL & WARNA ---
  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 0:
        return {
          label: "Terlalu Pendek",
          color: "bg-gray-200",
          text: "text-gray-500",
        };
      case 1:
        return { label: "Lemah", color: "bg-red-500", text: "text-red-500" };
      case 2:
        return { label: "Lemah", color: "bg-red-500", text: "text-red-500" };
      case 3:
        return {
          label: "Lumayan",
          color: "bg-yellow-500",
          text: "text-yellow-500",
        };
      case 4:
        return {
          label: "Sangat Kuat",
          color: "bg-green-500",
          text: "text-green-500",
        };
      default:
        return { label: "", color: "bg-gray-200", text: "text-gray-500" };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");

    // Cek kekuatan password realtime
    if (name === "password") {
      setPasswordStrength(checkStrength(value));
    }

    // Real-time password validation (Match check)
    if (name === "confirmPassword" || name === "password") {
      if (name === "confirmPassword") {
        if (value && formData.password !== value) {
          setPasswordError("Password tidak cocok");
        } else {
          setPasswordError("");
        }
      } else if (name === "password") {
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setPasswordError("Password tidak cocok");
        } else {
          setPasswordError("");
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok!");
      setLoading(false);
      return;
    }

    // Validasi tambahan: Minimal skor 2 (biar gak asal-asalan kali)
    if (passwordStrength < 2) {
      setError(
        "Password terlalu lemah! Gunakan kombinasi huruf, angka, dan simbol."
      );
      setLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result = register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
      });

      if (result.success) {
        navigate("/");
      } else {
        setError(result.message || "Pendaftaran gagal. Silakan coba lagi.");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const strengthInfo = getStrengthLabel();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Daftar Akun Baru</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Masuk di sini
            </Link>
          </p>
        </div>

        <form
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user text-gray-400"></i>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-gray-400"></i>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-phone text-gray-400"></i>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="08123456789"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Alamat <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-map-marker-alt text-gray-400"></i>
                </div>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jl. Contoh No. 123, Jakarta"
                ></textarea>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Alamat lengkap akan digunakan untuk keperluan pengiriman dan verifikasi
              </p>
            </div>

            {/* Password dengan Indikator Kekuatan */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    } text-gray-400 hover:text-gray-600`}
                  ></i>
                </button>
              </div>

              {/* --- VISUALISASI KEKUATAN PASSWORD --- */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    {/* Bar 1 */}
                    <div
                      className={`h-full w-1/4 border-r border-white ${
                        passwordStrength >= 1
                          ? strengthInfo.color
                          : "bg-transparent"
                      }`}
                    ></div>
                    {/* Bar 2 */}
                    <div
                      className={`h-full w-1/4 border-r border-white ${
                        passwordStrength >= 2
                          ? strengthInfo.color
                          : "bg-transparent"
                      }`}
                    ></div>
                    {/* Bar 3 */}
                    <div
                      className={`h-full w-1/4 border-r border-white ${
                        passwordStrength >= 3
                          ? strengthInfo.color
                          : "bg-transparent"
                      }`}
                    ></div>
                    {/* Bar 4 */}
                    <div
                      className={`h-full w-1/4 ${
                        passwordStrength >= 4
                          ? strengthInfo.color
                          : "bg-transparent"
                      }`}
                    ></div>
                  </div>
                  <p
                    className={`text-xs mt-1 text-right ${strengthInfo.text} font-medium`}
                  >
                    {strengthInfo.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ulangi password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i
                    className={`fas ${
                      showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                    } text-gray-400 hover:text-gray-600`}
                  ></i>
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-xs text-red-500">{passwordError}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || passwordError}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Mendaftar...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus mr-2"></i>
                Daftar Sekarang
              </>
            )}
          </button>

          {/* Terms */}
          <p className="text-xs text-center text-gray-600">
            Dengan mendaftar, Anda menyetujui{" "}
            <button
              type="button"
              onClick={() => setPolicyModal({ open: true, type: "terms" })}
              className="text-blue-600 hover:text-blue-500 underline"
            >
              Syarat & Ketentuan
            </button>{" "}
            dan{" "}
            <button
              type="button"
              onClick={() => setPolicyModal({ open: true, type: "privacy" })}
              className="text-blue-600 hover:text-blue-500 underline"
            >
              Kebijakan Privasi
            </button>{" "}
            kami
          </p>
          {policyModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
              <div className="bg-white rounded-xl max-w-lg w-full p-6 text-gray-900 relative shadow-xl">
                <button
                  type="button"
                  onClick={() => setPolicyModal({ open: false, type: null })}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  {policyModal.type === "privacy"
                    ? "Kebijakan Privasi"
                    : "Syarat & Ketentuan Layanan"}
                </h2>
                <div className="space-y-2 text-sm text-gray-700 leading-relaxed max-h-72 overflow-y-auto">
                  {policyModal.type === "privacy" ? (
                    <>
                      <p>
                        Data yang Anda isi saat pendaftaran (nama, email, nomor telepon, alamat)
                        digunakan untuk membuat akun dan mengelola pesanan di PharmaHub.
                      </p>
                      <p>
                        Kami tidak membagikan data pribadi ke pihak ketiga tanpa persetujuan Anda,
                        kecuali untuk kebutuhan operasional seperti pembayaran dan verifikasi.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Dengan membuat akun, Anda menyatakan bahwa informasi yang diberikan adalah benar
                        dan bersedia mengikuti ketentuan penggunaan layanan PharmaHub.
                      </p>
                      <p>
                        Obat yang membutuhkan resep hanya boleh digunakan sesuai anjuran dokter atau tenaga
                        medis profesional.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
