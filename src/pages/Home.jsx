import { Link } from 'react-router-dom';
import { products } from '../data/products';

const Home = () => {
  // Get featured products (first 8 products)
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-blue-100 text-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16 flex flex-col-reverse md:flex-row items-center min-h-[500px]">
        {/* Text */}
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-left mt-8 md:mt-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-700 leading-tight">
            One Stop <span className="text-blue-500">Solution</span><br />for Your Medicine Needs
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl">
            Kami tersedia 24/7. Pesan obat kapan saja dan nikmati layanan cepat dan terpercaya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              to="/products"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-center text-base"
            >
              Mulai Belanja Sekarang
            </Link>
            <Link
              to="/products"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition text-center text-base"
            >
              Lihat Daftar Obat
            </Link>
          </div>
        </div>

        {/* Ilustrasi */}
        <div className="w-full md:w-1/2 flex justify-center items-center mb-10 md:mb-0">
          <img
            src="/images/home-decor-pic.png"
            alt="Pharmacy Illustration"
            className="w-full max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain animate-slide-in animate-float drop-shadow-2xl"
            onError={(e) => {
            e.target.style.display = 'none';
            }}
          />
        </div>
      </section>

      {/* Fitur Unggulan */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
            Mengapa Memilih PharmaHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-blue-50">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shipping-fast text-blue-600 text-3xl"></i>
              </div>
              <h3 className="font-semibold text-xl mb-2">Pengambilan Cepat</h3>
              <p className="text-gray-600 text-base">
                Anda tidak perlu mengantri untuk mengambil obat
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-blue-50">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-md text-blue-600 text-3xl"></i>
              </div>
              <h3 className="font-semibold text-xl mb-2">Konsultasi Apoteker</h3>
              <p className="text-gray-600 text-base">
                Konsultasi gratis dengan apoteker berpengalaman
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-blue-50">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-blue-600 text-3xl"></i>
              </div>
              <h3 className="font-semibold text-xl mb-2">Obat Terjamin</h3>
              <p className="text-gray-600 text-base">Semua obat asli dengan izin BPOM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Kategori Populer */}
      <section className="bg-blue-50 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
            Kategori Populer
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-xl text-center shadow hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-capsules text-blue-600 text-2xl"></i>
              </div>
              <p className="font-medium text-gray-700 text-sm sm:text-base">Obat Bebas</p>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl text-center shadow hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-leaf text-blue-600 text-2xl"></i>
              </div>
              <p className="font-medium text-gray-700 text-sm sm:text-base">Herbal</p>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl text-center shadow hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-pills text-blue-600 text-2xl"></i>
              </div>
              <p className="font-medium text-gray-700 text-sm sm:text-base">Suplemen</p>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl text-center shadow hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-heart text-blue-600 text-2xl"></i>
              </div>
              <p className="font-medium text-gray-700 text-sm sm:text-base">Kesehatan Jantung</p>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl text-center shadow hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-brain text-blue-600 text-2xl"></i>
              </div>
              <p className="font-medium text-gray-700 text-sm sm:text-base">Kesehatan Otak</p>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl text-center shadow hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-baby text-blue-600 text-2xl"></i>
              </div>
              <p className="font-medium text-gray-700 text-sm sm:text-base">Bayi & Anak</p>
            </div>
          </div>
        </div>
      </section>

      {/* Produk Obat */}
      <section id="produk" className="container mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Daftar Obat yang Tersedia
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 text-center flex flex-col"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-36 h-36 object-cover mx-auto mb-4 rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                }}
              />
              <h3 className="font-semibold text-gray-800 text-base">{product.name}</h3>
              <p className="text-gray-600 text-sm mt-1 flex-grow">
                {product.description.length > 60 
                  ? product.description.substring(0, 60) + '...' 
                  : product.description}
              </p>
              <div className="mt-auto">
                <p className="text-blue-600 font-bold mt-4 text-lg">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
                <Link
                  to={`/product/${product.id}`}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full flex items-center justify-center"
                >
                  <i className="fas fa-shopping-cart"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Tombol Lihat Produk Lain */}
        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="fas fa-pills mr-2"></i>
            Lihat Produk Lain
            <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </section>

      {/* Testimoni */}
      <section className="bg-blue-50 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
            Apa Kata Pelanggan Kami?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-user text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-base">Rina Sari</h4>
                  <div className="flex text-yellow-400">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-base">
                "Pelayanan cepat dan obat sampai dalam waktu kurang dari 1 jam. Sangat membantu saat anak saya demam tengah malam."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-user text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-base">Budi Santoso</h4>
                  <div className="flex text-yellow-400">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-base">
                "Apoteker sangat membantu memberikan saran obat yang tepat. Harga juga lebih murah dibanding apotek biasa."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-user text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-base">Sari Dewi</h4>
                  <div className="flex text-yellow-400">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-base">
                "Sangat praktis, tidak perlu keluar rumah saat sakit. Obat selalu tersedia dan pengiriman tepat waktu."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
