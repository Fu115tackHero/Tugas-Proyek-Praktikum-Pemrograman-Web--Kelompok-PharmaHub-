import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProducts } from '../utils/api';

const Home = () => {
  // Get featured products from API
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await getProducts({ active: true });
        setFeaturedProducts(productsData.slice(0, 8));
      } catch (error) {
        console.error('Error fetching products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // 🔄 Auto-refresh featured products every 30 seconds
    const intervalId = setInterval(async () => {
      console.log('🔄 Auto-refreshing featured products...');
      try {
        const productsData = await getProducts({ active: true });
        setFeaturedProducts(productsData.slice(0, 8));
        console.log('✅ Featured products refreshed:', productsData.length, 'items');
      } catch (error) {
        console.error('❌ Error auto-refreshing featured products:', error);
      }
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => {
      console.log('🧹 Cleaning up featured products auto-refresh interval');
      clearInterval(intervalId);
    };
  }, []);

  // Image slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: 'One Stop Solution',
      subtitle: 'for Your Medicine Needs',
      description: 'Kami tersedia 24/7. Pesan obat kapan saja dan nikmati layanan cepat dan terpercaya.',
      image: '/images/home-decor-pic.png',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Belanja Online',
      subtitle: 'Mudah & Aman',
      description: 'Pesan obat dari rumah dengan sistem keranjang belanja yang praktis dan pembayaran yang aman.',
      image: '/images/home-decor-pic1.png',
      bgColor: 'from-green-50 to-green-100'
    },
    {
      title: 'Obat Original',
      subtitle: 'Harga Terjangkau',
      description: '15+ produk obat berkualitas dengan harga bersaing. Resep dokter atau obat bebas tersedia.',
      image: '/images/home-decor-pic2.png',
      bgColor: 'from-purple-50 to-purple-100'
    }
  ];

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-blue-100 text-gray-800">
      {/* Hero Section with Slider */}
      <section className={`bg-gradient-to-b ${slides[currentSlide].bgColor} transition-colors duration-500 min-h-screen flex items-center relative`}>
        {/* Navigation Arrows (anchored to section edges) */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition z-40 hidden md:block"
          aria-label="Previous slide"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition z-40 hidden md:block"
          aria-label="Next slide"
        >
          <i className="fas fa-chevron-right"></i>
        </button>

        <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 relative w-full">
          {/* Slider Content */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12">
            {/* Text */}
            <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-700 leading-tight animate-fade-in">
                {slides[currentSlide].title}{' '}
                <span className="text-blue-500">{slides[currentSlide].subtitle}</span>
              </h1>
              <p className="text-gray-600 text-lg sm:text-xl animate-fade-in">
                {slides[currentSlide].description}
              </p>
              <div className="flex justify-center md:justify-start mt-6">
                <Link
                  to="/products"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-center text-base shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
                >
                  Mulai Belanja Sekarang
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="w-full md:w-1/2 flex justify-center items-center mb-8 md:mb-0">
              <img
                src={slides[currentSlide].image}
                alt="Pharmacy Illustration"
                className="w-full max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain animate-slide-in"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Dots Indicator - Moved below hero section */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentSlide === index
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-400 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
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
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Memuat produk...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className={`
                  group relative bg-white rounded-2xl p-5 flex flex-col border border-transparent
                  transition-all duration-300 ease-out
                  hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200
                  ${product.prescriptionRequired ? 'border-l-4 border-l-red-500' : ''}
                `}
              >
                <img
                  src={(product.image && product.image.startsWith('/'))
                    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${product.image}`
                    : (product.image || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/${product.id}/image`)}
                  alt={product.name}
                  className="w-36 h-36 object-cover mx-auto mb-4 rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
              <h3 className="font-semibold text-gray-800 text-base">{product.name}</h3>
              <p className="text-gray-600 text-sm mt-1 flex-grow">
                {product.description && product.description.length > 60 
                  ? product.description.substring(0, 60) + '...' 
                  : (product.description || 'Tidak ada deskripsi')}
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
        )}

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
