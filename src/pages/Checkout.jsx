import { Link } from 'react-router-dom';

const Checkout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
        
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <i className="fas fa-tools text-gray-400 text-5xl mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Halaman Checkout Sedang Dalam Pengembangan
          </h3>
          <p className="text-gray-600 mb-6">
            Fitur checkout akan segera tersedia
          </p>
          <Link
            to="/cart"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Kembali ke Keranjang
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
