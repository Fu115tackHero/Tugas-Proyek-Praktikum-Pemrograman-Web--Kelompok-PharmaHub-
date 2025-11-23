import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../utils/api';

const Products = () => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState(['Semua Produk']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'Semua Produk',
    priceRange: 'all',
    minPrice: '',
    maxPrice: '',
    sort: 'name-asc'
  });

  // Fetch products and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        
        setAllProducts(productsData);
        // Add "Semua Produk" to beginning of categories list
        const categoryList = ['Semua Produk', ...categoriesData.map(c => c.category_name || c.name)];
        setCategories(categoryList);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Gagal memuat produk. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 🔄 Auto-refresh products every 30 seconds
    const intervalId = setInterval(async () => {
      console.log('🔄 Auto-refreshing products...');
      try {
        const productsData = await getProducts();
        setAllProducts(productsData);
        console.log('✅ Products refreshed:', productsData.length, 'items');
      } catch (err) {
        console.error('❌ Error auto-refreshing products:', err);
      }
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => {
      console.log('🧹 Cleaning up products auto-refresh interval');
      clearInterval(intervalId);
    };
  }, []);

  // Apply filters whenever filters or products change
  useEffect(() => {
    applyFilters();
  }, [filters, allProducts]);

  const applyFilters = () => {
    let result = [...allProducts];

    // Category filter
    if (filters.category !== 'Semua Produk') {
      result = result.filter(p => p.category === filters.category);
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      if (filters.priceRange === 'custom') {
        let min = parseInt(filters.minPrice, 10);
        let max = parseInt(filters.maxPrice, 10);

        if (!isNaN(min) && !isNaN(max) && min > max) {
          const temp = min;
          min = max;
          max = temp;
        }

        result = result.filter(p => {
          const price = p.price;
          if (!isNaN(min) && price < min) return false;
          if (!isNaN(max) && price > max) return false;
          return true;
        });
      } else if (filters.priceRange === '0-15000') {
        result = result.filter(p => p.price < 15000);
      } else if (filters.priceRange === '15000-30000') {
        result = result.filter(p => p.price >= 15000 && p.price <= 30000);
      } else if (filters.priceRange === '30000-50000') {
        result = result.filter(p => p.price > 30000 && p.price <= 50000);
      } else if (filters.priceRange === '50000+') {
        result = result.filter(p => p.price > 50000);
      }
    }

    // Sort
    if (filters.sort === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (filters.sort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2">
            <li className="flex">
              <Link to="/" className="text-gray-500 hover:text-blue-600 transition">
                <i className="fas fa-home"></i>
              </Link>
            </li>
            <li className="flex items-center">
              <i className="fas fa-chevron-right text-gray-400 text-sm mx-2"></i>
              <span className="text-blue-600 font-medium">Semua Produk</span>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Semua Produk Obat</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Temukan berbagai macam obat dan produk kesehatan berkualitas dengan harga terjangkau. 
            Semua produk terjamin keaslian dan sudah mendapat izin dari BPOM.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && allProducts.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-5xl text-blue-600 mb-4"></i>
              <p className="text-gray-600 text-lg">Memuat produk...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Produk</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {(categories || ['Semua Produk']).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rentang Harga</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Harga</option>
                <option value="0-15000">Di bawah Rp 15.000</option>
                <option value="15000-30000">Rp 15.000 - Rp 30.000</option>
                <option value="30000-50000">Rp 30.000 - Rp 50.000</option>
                <option value="50000+">Di atas Rp 50.000</option>
                <option value="custom">Rentang Harga Khusus</option>
              </select>
              {filters.priceRange === 'custom' && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Min (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Maks (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100000"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name-asc">Nama A-Z</option>
                <option value="name-desc">Nama Z-A</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
             <Link
              key={product.id}
              to={`/product/${product.id}`}
              className={`
                group relative bg-white rounded-2xl p-5 flex flex-col border border-transparent
                transition-all duration-300 ease-out
                hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200
                ${product.prescriptionRequired ? 'border-l-4 border-l-red-500' : ''}
              `}
              >
                <img
                  src={product.image || `${import.meta.env.VITE_API_URL}/api/products/${product.id}/image`}
                  alt={product.name}
                  className="w-32 h-32 object-cover mx-auto mb-4 rounded-lg"
                  onError={(e) => {
                    console.error(`Failed to load image for product ${product.id}`);
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23f0f0f0' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                  }}
                />
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {product.howItWorks && product.howItWorks.length > 80 
                    ? product.howItWorks.substring(0, 80) + '...' 
                    : (product.howItWorks || product.uses || 'Tidak ada deskripsi')}
                </p>
                {product.prescriptionRequired && (
                  <div className="mt-2 mb-2">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                      Perlu Resep Dokter
                    </span>
                  </div>
                )}
                <div className="mt-auto">
                  <p className="text-blue-600 font-bold mt-4">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <div className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full flex items-center justify-center">
                    <i className="fas fa-eye mr-2"></i>
                    Lihat Detail
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <i className="fas fa-search text-gray-400 text-6xl mb-4"></i>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Produk tidak ditemukan
            </h3>
            <p className="text-gray-600">
              Coba ubah filter atau kata kunci pencarian Anda
            </p>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
