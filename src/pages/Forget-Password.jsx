import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgetPassword = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Jika sudah login, redirect ke halaman utama
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email tidak boleh kosong');
      setLoading(false);
      return;
    }

    try {
      // --- Simulasi Pengiriman Email ---
      // Di aplikasi nyata, di sini kamu akan memanggil fungsi
      // dari context atau service, contoh: await forgotPassword(email)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulasi sukses
      setSuccess('Jika email terdaftar, link reset password telah dikirim!');
      setEmail('');
      
    } catch (err) {
      // Jika error dari backend
      setError('Gagal mengirim link. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full mx-4 my-8">
        
        {/* Konten Form */}
        <div className="p-6 md:p-10 flex flex-col justify-center relative z-10">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/images/pharmahub-logo.png" 
                alt="Logo PharmaHub" 
                className="w-24"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Lupa Password?</h2>
            <p className="text-gray-500">Masukkan email Anda untuk reset password</p>
          </div>

          {/* Pesan Error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          {/* Pesan Sukses */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg relative">
              <i className="fas fa-check-circle mr-2"></i>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="Masukkan email terdaftar"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                  required
                />
                <i className="fas fa-envelope absolute left-3 top-3.5 text-gray-400"></i>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                'Kirim Link Reset'
              )}
            </button>

            <div className="text-center mt-4">
              <p className="text-gray-600">
                Ingat password?{' '}
                <Link
                  to="/login"
                  className="text-blue-500 font-medium hover:underline transition-colors duration-300"
                >
                  Kembali ke Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;