import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductService from "../services/product.service";

const Products = () => {
  // Hook untuk membaca parameter URL (misal: ?category=Obat+Demam)
  const [searchParams] = useSearchParams();

  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState(["Semua Produk"]);
  const [filters, setFilters] = useState({
    category: "Semua Produk",
    priceRange: "all",
    sort: "name-asc",
  });

  /**
   * EFFECT 1: Menangani Perubahan URL & Scroll Position
   * Dijalankan saat halaman dimuat atau URL berubah
   */
  useEffect(() => {
    // 1. FIX: Scroll ke paling atas agar halaman tidak nyangkut di bawah
    window.scrollTo(0, 0);

    // 2. Ambil kategori dari URL
    const categoryFromUrl = searchParams.get("category");

    // 3. Cek apakah kategori dari URL valid (ada di daftar kategori dari backend)
    if (categoryFromUrl && categoryOptions.includes(categoryFromUrl)) {
      setFilters((prev) => ({
        ...prev,
        category: categoryFromUrl,
      }));
    } else {
      // Jika tidak ada kategori di URL (user klik menu navbar biasa), reset ke default
      setFilters((prev) => ({
        ...prev,
        category: "Semua Produk",
      }));
    }
  }, [searchParams]);

  // Load products & categories from backend
  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          ProductService.getAllProducts(),
          ProductService.getCategories(),
        ]);
        const productsData = prodRes?.data || [];
        const categoriesData = catRes?.data || [];
        setAllProducts(productsData);
        setFilteredProducts(productsData);
        setCategoryOptions([
          "Semua Produk",
          ...categoriesData.map((c) => c.category_name || c.name),
        ]);
      } catch (e) {
        console.error("Failed to load products/categories", e);
      }
    }
    load();
  }, []);

  /**
   * EFFECT 2: Menjalankan Logika Filter
   * Dijalankan setiap kali state 'filters' berubah
   */
  useEffect(() => {
    applyFilters();
  }, [filters]);

  const applyFilters = () => {
    let result = [...allProducts];

    // 1. Filter Kategori
    if (filters.category !== "Semua Produk") {
      result = result.filter(
        (p) =>
          (p.category_name || "").toLowerCase() ===
          filters.category.toLowerCase()
      );
    }

    // 2. Filter Rentang Harga
    if (filters.priceRange !== "all") {
      if (filters.priceRange === "0-15000") {
        result = result.filter((p) => p.price < 15000);
      } else if (filters.priceRange === "15000-30000") {
        result = result.filter((p) => p.price >= 15000 && p.price <= 30000);
      } else if (filters.priceRange === "30000-50000") {
        result = result.filter((p) => p.price > 30000 && p.price <= 50000);
      } else if (filters.priceRange === "50000+") {
        result = result.filter((p) => p.price > 50000);
      }
    }

    // 3. Sortir (Urutkan)
    if (filters.sort === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (filters.sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2">
            <li className="flex">
              <Link
                to="/"
                className="text-gray-500 hover:text-blue-600 transition"
              >
                <i className="fas fa-home"></i>
              </Link>
            </li>
            <li className="flex items-center">
              <i className="fas fa-chevron-right text-gray-400 text-sm mx-2"></i>
              <span className="text-blue-600 font-medium">
                {filters.category}
              </span>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {filters.category === "Semua Produk"
              ? "Semua Produk Obat"
              : filters.category}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Temukan berbagai macam obat dan produk kesehatan berkualitas dengan
            harga terjangkau. Semua produk terjamin keaslian dan sudah mendapat
            izin dari BPOM.
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Filter Produk
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rentang Harga
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) =>
                  handleFilterChange("priceRange", e.target.value)
                }
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urutkan
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
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
                  ${
                    product.prescriptionRequired
                      ? "border-l-4 border-l-red-500"
                      : ""
                  }
                `}
              >
                <img
                  src={product.image || "https://via.placeholder.com/150?text=No+Image"}
                  alt={product.name || "Product"}
                  className="w-32 h-32 object-cover mx-auto mb-4 rounded-lg"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/150?text=No+Image";
                  }}
                />
                <h3 className="font-semibold text-gray-800">{product.name || "Produk"}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {product.description && product.description.length > 80
                    ? product.description.substring(0, 80) + "..."
                    : product.description || ""}
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
                    Rp {(product.price || 0).toLocaleString("id-ID")}
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
          /* Tampilan jika produk kosong */
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <i className="fas fa-search text-gray-400 text-6xl mb-4"></i>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Produk tidak ditemukan
            </h3>
            <p className="text-gray-600">
              Tidak ada produk dalam kategori{" "}
              <strong>{filters.category}</strong> atau filter yang Anda pilih.
            </p>
            <button
              onClick={() => handleFilterChange("category", "Semua Produk")}
              className="mt-4 text-blue-600 font-semibold hover:underline"
            >
              Lihat Semua Produk
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
