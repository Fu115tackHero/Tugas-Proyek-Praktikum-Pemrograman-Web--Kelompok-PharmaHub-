import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  
  // State untuk mengontrol visibilitas password
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    try {
      console.log('🔐 Login attempt:', formData.email);
      
      // Call login API (now properly awaited)
      const result = await login(formData.email, formData.password);

      console.log('Login result:', result);

      if (result.success) {
        console.log('✅ Login successful!');
        if (formData.email === "admin@pharmahub.com") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        console.log('❌ Login failed:', result.message);
        setError(result.message || "Login gagal. Silakan coba lagi.");
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? "Memproses..." : "Masuk ke Dashboard"}</span>
              {loading && <i className="fas fa-spinner fa-spin ml-2"></i>}
            </button>

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