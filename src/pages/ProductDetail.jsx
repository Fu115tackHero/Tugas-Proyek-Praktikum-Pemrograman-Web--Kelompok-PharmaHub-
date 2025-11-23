import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById } from "../utils/api";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("ingredients");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        console.log("Product data:", data);
        console.log("Product ID:", data?.id);
        console.log("Image URL:", data?.image);
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Produk tidak ditemukan");
        setTimeout(() => navigate("/products"), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p>Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-600 mb-4"></i>
          <p className="text-red-600 mb-4">{error || "Produk tidak ditemukan"}</p>
          <Link to="/products" className="text-blue-600 hover:text-blue-800 underline">
            Kembali ke Produk
          </Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
    setSuccessMessage("Produk berhasil dimasukkan ke keranjang!");
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // --- PERUBAHAN LOGIKA BELI SEKARANG ---
  const handleBuyNow = () => {
    // 1. Masukkan produk ke keranjang
    addToCart(product, quantity);
    // 2. Arahkan ke halaman KERANJANG (Cart) agar bisa input diskon
    navigate("/cart"); 
  };

  const tabs = [
    {
      id: "ingredients",
      label: "Kandungan",
      icon: "fa-flask",
      data: product.ingredients,
    },
    {
      id: "precaution",
      label: "Peringatan",
      icon: "fa-exclamation-triangle",
      data: product.precaution,
    },
    {
      id: "sideEffects",
      label: "Efek Samping",
      icon: "fa-heartbeat",
      data: product.sideEffects,
    },
    {
      id: "interactions",
      label: "Interaksi Obat",
      icon: "fa-pills",
      data: product.interactions,
    },
    {
      id: "indication",
      label: "Indikasi",
      icon: "fa-notes-medical",
      data: product.indication,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
      <div className="container mx-auto px-4 sm:px-6">
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center shadow-sm">
            <i className="fas fa-check-circle mr-2"></i>
            <span>{successMessage}</span>
          </div>
        )}
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li className="flex">
              <Link
                to="/"
                className="text-gray-500 hover:text-blue-600 transition"
              >
                <i className="fas fa-home"></i>
              </Link>
            </li>
            <li className="flex items-center">
              <i className="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
              <Link
                to="/products"
                className="text-gray-500 hover:text-blue-600 transition"
              >
                Produk
              </Link>
            </li>
            <li className="flex items-center">
              <i className="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
              <span className="text-blue-600 font-medium">{product.name}</span>
            </li>
          </ol>
        </nav>

        {/* Product Detail */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Image */}
            <div className="flex justify-center items-center">
              <div className="bg-gray-100 rounded-lg p-8 w-full max-w-md">
                <img
                  src={product.image || `${import.meta.env.VITE_API_URL}/api/products/${product.id}/image`}
                  alt={product.name}
                  className="w-full h-auto max-w-md object-contain rounded-lg transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    console.error("Image load error for:", e.target.src);
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f0f0f0' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Brand and Name */}
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">
                  Brand: {product.brand}
                </p>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {product.name}
                </h1>
                {product.prescriptionRequired && (
                  <div>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                      Perlu Resep Dokter
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    Rp {product.price.toLocaleString("id-ID")}
                  </span>
                  <span className="text-sm text-gray-500">Per kemasan</span>
                </div>
              </div>

              {/* Used For */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Kegunaan:</h3>
                <p className="text-gray-600">{product.uses}</p>
              </div>

              {/* How it works */}
              {product.howItWorks && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Cara Kerja:
                  </h3>
                  <p className="text-gray-600">{product.howItWorks}</p>
                </div>
              )}

              {/* Generics */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Generik:</h3>
                <span className="text-blue-600 font-medium">
                  {product.genericName}
                </span>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">Jumlah:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-3 py-2 hover:bg-gray-100 transition"
                      disabled={quantity <= 1}
                    >
                      <i className="fas fa-minus text-sm"></i>
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-3 py-2 hover:bg-gray-100 transition"
                      disabled={quantity >= product.stock}
                    >
                      <i className="fas fa-plus text-sm"></i>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="bg-white border-2 border-blue-600 text-blue-600 py-4 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center justify-center space-x-2"
                  >
                    <i className="fas fa-shopping-cart"></i>
                    <span>Masukkan Ke Keranjang</span>
                  </button>

                  {/* Beli Sekarang (Redirects to Cart) */}
                  <button
                    onClick={handleBuyNow}
                    className="bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                  >
                    <i className="fas fa-credit-card"></i>
                    <span>Checkout</span>
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Informasi Penting:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Pastikan membaca aturan pakai sebelum mengonsumsi</li>
                  <li>• Simpan di tempat sejuk dan kering</li>
                  <li>• Jauhkan dari jangkauan anak-anak</li>
                  <li>• Konsultasikan dengan apoteker jika diperlukan</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={activeTab === tab.id ? "block" : "hidden"}
                >
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <i className={`fas ${tab.icon} mr-2 text-blue-600`}></i>
                    {tab.label}:
                  </h4>
                  <div className="text-gray-600 space-y-2">
                    {tab.data && tab.data.length > 0 ? (
                      <>
                        {tab.id === "ingredients" ? (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h5 className="font-medium text-gray-800 mb-3">
                              Komposisi per tablet/kapsul:
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {tab.data.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center py-1"
                                >
                                  <i className="fas fa-circle text-blue-400 text-xs mr-2"></i>
                                  <span className="text-sm">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          tab.data.map((item, index) => (
                            <p key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{item}</span>
                            </p>
                          ))
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 italic">
                        Informasi {tab.label.toLowerCase()} tidak tersedia.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warning for Prescription Required */}
        {product.prescriptionRequired && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <i className="fas fa-exclamation-triangle text-red-500 text-xl mr-3 mt-1"></i>
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Perhatian!</h3>
                <p className="text-red-700 text-sm">
                  Obat ini memerlukan resep dokter. Pastikan Anda memiliki resep
                  yang valid sebelum melakukan pembelian. Konsultasikan dengan
                  dokter atau apoteker kami untuk informasi lebih lanjut.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;