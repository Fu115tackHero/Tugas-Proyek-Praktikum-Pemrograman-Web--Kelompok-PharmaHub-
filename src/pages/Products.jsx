import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products, categories, getProductsByCategory } from '../data/products';

const Products = () => {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [filters, setFilters] = useState({
    category: 'Semua Produk',
    priceRange: 'all',
    sort: 'name-asc'
  });

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const applyFilters = () => {
    let result = [...products];

    // Category filter
    if (filters.category !== 'Semua Produk') {
      result = getProductsByCategory(filters.category);
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      if (filters.priceRange === '0-15000') {
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
              >
                {categories.map(category => (
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
              </select>
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

        {/* Products Grid (BAGIAN INI YANG DIMODIFIKASI UTAMA) */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                // Class 'group' di sini sangat penting untuk trigger animasi child elements
                className={`group bg-white rounded-2xl shadow-md hover:shadow-glass hover:-translate-y-2 transition-all duration-300 p-5 flex flex-col border border-transparent hover:border-blue-100 relative overflow-hidden ${
                  product.prescriptionRequired ? 'ring-1 ring-red-100' : ''
                }`}
              >
                {/* Elemen Dekoratif: Lingkaran background yang muncul saat hover */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col h-full">
                  {/* Gambar Produk dengan efek scale */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-32 h-32 object-cover mx-auto mb-4 rounded-lg group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                  
                  {/* Badge Kategori (Tambahan baru untuk estetika) */}
                  <div className="text-xs text-blue-500 font-medium mb-1 uppercase tracking-wide">
                      {product.category}
                  </div>

                  {/* Nama Produk */}
                  <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                      {product.name}
                  </h3>
                  
                  {/* Deskripsi */}
                  <p className="text-gray-600 text-sm mt-1 mb-3 flex-grow">
                    {product.description.length > 80 
                      ? product.description.substring(0, 80) + '...' 
                      : product.description}
                  </p>
                  
                  {/* Badge Resep Dokter */}
                  {product.prescriptionRequired && (
                    <div className="mb-3">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                        Perlu Resep Dokter
                      </span>
                    </div>
                  )}
                  
                  {/* Bagian Bawah: Harga dan Tombol Action */}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                    <p className="text-blue-600 font-bold text-lg">
                      Rp {product.price.toLocaleString('id-ID')}
                    </p>
                    
                    {/* Tombol Panah yang berubah warna saat hover card */}
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
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
      </div>
    </div>
  );
};

export default Products;