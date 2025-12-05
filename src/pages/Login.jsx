import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  // State untuk mengontrol visibilitas password
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'success'
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check for suspended parameter
  useEffect(() => {
    if (searchParams.get("suspended") === "true") {
      setError("Akun Anda telah di-suspend. Silakan hubungi administrator.");
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStatus("idle");

    try {
      // Simulasi API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Panggil fungsi login dari AuthContext (async)
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Tampilkan status sukses di tombol, lalu redirect setelah jeda singkat
        setStatus("success");
        setError("");

        setTimeout(() => {
          if (formData.email === "admin@pharmahub.com") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }, 2000);
      } else {
        const msg =
          result.message ||
          "Login gagal. Periksa kembali email dan password lalu coba lagi.";
        setError(msg);
      }
    } catch (err) {
      const msg =
        "Terjadi kesalahan pada sistem. Silakan coba lagi nanti atau hubungi admin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError("");
    setStatus("idle");

    try {
      const token = credentialResponse?.credential;
      if (!token) {
        setError("Token Google tidak valid.");
        return;
      }

      const result = await loginWithGoogle(token);
      if (result.success) {
        navigate("/");
        return;
      }

      setError(result.message || "Login Google gagal. Silakan coba lagi.");
    } catch (err) {
      setError("Login Google gagal. Silakan coba lagi.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Login Google dibatalkan atau gagal.");
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex max-w-5xl w-full mx-4 my-8">
        {/* Left Section: Login Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center relative z-10">
          <div className="mb-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <img
                src="/images/pharmahub-logo.png"
                alt="Logo PharmaHub"
                className="w-24"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              Selamat Datang
            </h2>
            <p className="text-gray-500">
              Sign in untuk Mendapat Fitur Lengkap
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username atau email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Masukkan email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                  required
                />
                <i className="fas fa-envelope absolute left-3 top-3.5 text-gray-400"></i>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  // Ubah tipe input berdasarkan state showPassword
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  // Tambahkan pr-10 agar teks tidak tertutup ikon mata
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                  required
                />
                <i className="fas fa-lock absolute left-3 top-3.5 text-gray-400"></i>
                
                {/* Tombol Toggle Mata */}
                <button
                  type="button" // Penting: type button agar tidak submit form
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              <Link
                to="/forget-password"
                className="text-sm text-blue-500 float-right mt-2 hover:underline transition-colors duration-300"
              >
                Lupa Password?
              </Link>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-700"
              >
                Ingat Saya
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || status === "success"}
              className={`w-full py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
                ${
                  status === "success"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                }
              `}
            >
              {status === "success" ? (
                "Berhasil masuk, mengalihkan..."
              ) : loading ? (
                <>
                  <span>Memproses...</span>
                  <i className="fas fa-spinner fa-spin ml-2"></i>
                </>
              ) : (
                "Masuk ke Dashboard"
                )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Atau</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                text="signin_with"
                shape="rectangular"
                size="large"
                width="280"
                disabled={googleLoading}
              />
            </div>

            <div className="text-center mt-4">
              <p className="text-gray-600">
                Belum Punya Akun?{" "}
                <Link
                  to="/register"
                  className="text-blue-500 font-medium hover:underline transition-colors duration-300"
                >
                  Daftar
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Right Section: Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 relative items-center justify-center">
          <div className="relative z-10 w-4/5 text-center">
            <img
              src="/images/pharmacist.jpg"
              alt="Pharmacist Illustration"
              className="w-full max-w-xs mx-auto drop-shadow-2xl rounded-lg"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="mt-6 text-white">
              <h3 className="text-xl font-bold mb-2">
                Pharmacy Management Made Easy
              </h3>
              <p className="text-blue-100">
                Access patient records, manage inventory, and streamline
                workflows
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
