import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    savedForLater,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    saveForLater,
    moveToCart,
    removeFromSaved,
  } = useCart();

  const handleQuantityChange = (productId, delta) => {
    const item = cart.find((item) => item.id === productId);
    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity > 0) {
        updateQuantity(productId, newQuantity);
      }
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Keranjang Anda kosong");
      return;
    }
    navigate("/checkout");
  };

  const subtotal = getCartTotal();
  const discount = 0;
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal + tax - discount;

  return (
    <div className="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-blue-600 hover:text-blue-700 transition"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Kembali belanja
              </button>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-800">
                Keranjang Belanja
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              <span>{cart.length}</span> item dalam keranjang
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {cart.length === 0 ? (
                /* Empty Cart Message */
                <div className="p-8 text-center">
                  <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Keranjang Anda Kosong
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Mulai berbelanja dan tambahkan produk ke keranjang
                  </p>
                  <Link
                    to="/products"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
                  >
                    <i className="fas fa-shopping-bag mr-2"></i>
                    Mulai Belanja
                  </Link>
                </div>
              ) : (
                <>
                  {/* Cart Items Container */}
                  <div className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/64x64?text=No+Image";
                            }}
                          />
                          <div>
                            <Link
                              to={`/product/${item.id}`}
                              className="font-medium text-gray-800 hover:text-blue-600"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm text-gray-600">
                              Obat untuk kesehatan
                            </p>
                            <div className="flex items-center mt-2">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                <i className="fas fa-trash mr-1"></i> Hapus
                              </button>
                              <button
                                onClick={() => saveForLater(item.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-4"
                              >
                                <i className="far fa-bookmark mr-1"></i> Simpan
                                untuk nanti
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                              disabled={item.quantity <= 1}
                            >
                              <i className="fas fa-minus text-gray-600"></i>
                            </button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                              disabled={item.quantity >= item.stock}
                            >
                              <i className="fas fa-plus text-gray-600"></i>
                            </button>
                          </div>
                          {/* Price */}
                          <div className="text-right">
                            <p className="font-medium text-gray-800">
                              Rp{" "}
                              {(item.price * item.quantity).toLocaleString(
                                "id-ID"
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              Rp {item.price.toLocaleString("id-ID")}/pcs
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Remove All Button */}
                  <div className="p-4 border-t border-gray-200">
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                    >
                      <i className="fas fa-trash mr-2"></i>
                      Hapus semua
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Saved for Later Section */}
            {savedForLater.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Disimpan untuk Nanti ({savedForLater.length})
                </h2>
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
                  {savedForLater.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg grayscale opacity-60"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/64x64?text=No+Image";
                          }}
                        />
                        <div>
                          <Link
                            to={`/product/${item.id}`}
                            className="font-medium text-gray-600 hover:text-blue-600"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-gray-500">
                            Obat untuk kesehatan
                          </p>
                          <div className="flex items-center mt-2">
                            <button
                              onClick={() => removeFromSaved(item.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              <i className="fas fa-trash mr-1"></i> Hapus
                            </button>
                            <button
                              onClick={() => moveToCart(item.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-4"
                            >
                              <i className="fas fa-shopping-cart mr-1"></i>{" "}
                              Pindahkan ke keranjang
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Jml: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              {/* Coupon Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 font-medium">
                    Punya kupon?
                  </span>
                  <i className="fas fa-tag text-gray-400"></i>
                </div>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Masukkan kupon"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition font-medium">
                    Terapkan
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Diskon:</span>
                  <span className="text-red-600">
                    -Rp {discount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Pajak:</span>
                  <span>+Rp {tax.toLocaleString("id-ID")}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-semibold text-gray-800">
                  <span>Total:</span>
                  <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="block w-full bg-blue-800 text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition text-center mb-4"
              >
                Bayar Sekarang
              </button>

              {/* Payment Methods */}
              <div className="payment-methods">
                <div className="flex items-center justify-center space-x-3 flex-wrap gap-2">
                  <img
                    src="https://cdn.worldvectorlogo.com/logos/visa-2.svg"
                    alt="Visa"
                    className="h-6"
                  />
                  <img
                    src="https://cdn.worldvectorlogo.com/logos/mastercard-6.svg"
                    alt="Mastercard"
                    className="h-6"
                  />
                  <img
                    src="https://cdn.worldvectorlogo.com/logos/american-express-3.svg"
                    alt="American Express"
                    className="h-6"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/512px-Logo_dana_blue.svg.png"
                    alt="Dana"
                    className="h-6"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/512px-Logo_ovo_purple.svg.png"
                    alt="OVO"
                    className="h-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
