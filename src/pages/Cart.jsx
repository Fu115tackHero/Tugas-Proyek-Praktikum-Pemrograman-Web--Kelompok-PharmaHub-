import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import AlertModal from "../components/AlertModal";
import ConfirmModal from "../components/ConfirmModal";
import { useAlert } from "../hooks/useAlert";

const Cart = () => {
  const navigate = useNavigate();
  const { alertState, showAlert, hideAlert } = useAlert();
  const {
    cart,
    savedForLater,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getDiscountAmount,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    availableCoupons,
    saveForLater,
    moveToCart,
    removeFromSaved,
    loading,
    error,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // Track which action is loading
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponMessage("Masukkan kode kupon");
      setCouponError(true);
      return;
    }

    setActionLoading("applyCoupon");
    console.log("🎟️ Applying coupon:", couponInput);

    const result = await applyCoupon(couponInput);

    console.log("🎟️ Coupon result:", result);
    setCouponMessage(result.message);
    setCouponError(!result.success);
    setActionLoading(null);

    if (result.success) {
      setCouponInput("");
      // Clear message after 3 seconds
      setTimeout(() => {
        setCouponMessage("");
      }, 3000);
    }
  };

  const handleRemoveCoupon = async () => {
    setActionLoading("removeCoupon");
    console.log("🎟️ Removing coupon");

    await removeCoupon();

    setCouponInput("");
    setCouponMessage("");
    setCouponError(false);
    setActionLoading(null);
  };

  const handleQuantityChange = async (productId, delta) => {
    const item = cart.find((item) => item.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) return;

    setActionLoading(`quantity-${productId}`);
    console.log(`🔢 Updating quantity for product ${productId}:`, newQuantity);

    const result = await updateQuantity(productId, newQuantity);

    if (!result.success) {
      console.error("❌ Failed to update quantity:", result.message);
      showAlert(result.message, "error");
    }
    setActionLoading(null);
  };

  const handleRemoveFromCart = async (productId) => {
    setActionLoading(`remove-${productId}`);
    console.log("🗑️ Removing from cart:", productId);

    const result = await removeFromCart(productId);

    if (!result.success) {
      console.error("❌ Failed to remove from cart:", result.message);
      showAlert(result.message, "error");
    }
    setActionLoading(null);
  };

  const handleSaveForLater = async (productId) => {
    setActionLoading(`save-${productId}`);
    console.log("💾 Saving for later:", productId);

    const result = await saveForLater(productId);

    if (!result.success) {
      console.error("❌ Failed to save for later:", result.message);
      showAlert(result.message, "error");
    }
    setActionLoading(null);
  };

  const handleMoveToCart = async (productId) => {
    setActionLoading(`move-${productId}`);
    console.log("🛒 Moving to cart:", productId);

    const result = await moveToCart(productId);

    if (!result.success) {
      console.error("❌ Failed to move to cart:", result.message);
      showAlert(result.message, "error");
    }
    setActionLoading(null);
  };

  const handleRemoveFromSaved = async (productId) => {
    setActionLoading(`removeSaved-${productId}`);
    console.log("🗑️ Removing from saved:", productId);

    const result = await removeFromSaved(productId);

    if (!result.success) {
      console.error("❌ Failed to remove from saved:", result.message);
      showAlert(result.message, "error");
    }
    setActionLoading(null);
  };

  const handleClearCart = async () => {
    setShowClearConfirm(false);

    setActionLoading("clearCart");
    console.log("🗑️ Clearing cart");

    const result = await clearCart();

    if (!result.success) {
      console.error("❌ Failed to clear cart:", result.message);
      showAlert(result.message, "error");
    }
    setActionLoading(null);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      showAlert("Keranjang Anda kosong", "warning");
      return;
    }
    console.log("💳 Proceeding to checkout");
    navigate("/checkout");
  };

  const subtotal = getCartTotal();
  const discount = getDiscountAmount();
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal + tax - discount;

  // Show loading state on initial load
  if (loading && cart.length === 0) {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
          <p className="text-gray-800 font-medium mb-2">
            Gagal memuat keranjang
          </p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

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
                  {/* Clear All Button */}
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">
                      Produk dalam Keranjang
                    </h2>
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      disabled={actionLoading === "clearCart"}
                      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      {actionLoading === "clearCart" ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-1"></i>{" "}
                          Menghapus...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-trash mr-1"></i> Hapus Semua
                        </>
                      )}
                    </button>
                  </div>

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
                              {item.description || "Obat untuk kesehatan"}
                            </p>
                            <div className="flex items-center mt-2">
                              <button
                                onClick={() => handleRemoveFromCart(item.id)}
                                disabled={actionLoading === `remove-${item.id}`}
                                className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                              >
                                {actionLoading === `remove-${item.id}` ? (
                                  <>
                                    <i className="fas fa-spinner fa-spin mr-1"></i>{" "}
                                    Menghapus...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-trash mr-1"></i> Hapus
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleSaveForLater(item.id)}
                                disabled={actionLoading === `save-${item.id}`}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-4 disabled:opacity-50"
                              >
                                {actionLoading === `save-${item.id}` ? (
                                  <>
                                    <i className="fas fa-spinner fa-spin mr-1"></i>{" "}
                                    Menyimpan...
                                  </>
                                ) : (
                                  <>
                                    <i className="far fa-bookmark mr-1"></i>{" "}
                                    Simpan untuk nanti
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={
                                item.quantity <= 1 ||
                                actionLoading === `quantity-${item.id}`
                              }
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <i className="fas fa-minus text-gray-600"></i>
                            </button>
                            <span className="w-8 text-center">
                              {actionLoading === `quantity-${item.id}` ? (
                                <i className="fas fa-spinner fa-spin text-blue-600"></i>
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              disabled={
                                item.quantity >= item.stock ||
                                actionLoading === `quantity-${item.id}`
                              }
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                            {item.stock < 10 && (
                              <p className="text-xs text-orange-600 mt-1">
                                Stok tinggal {item.stock}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Saved for Later Section */}
            {savedForLater.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm mt-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-800">
                    Disimpan untuk Nanti ({savedForLater.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {savedForLater.map((item) => (
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
                            Rp {item.price.toLocaleString("id-ID")}
                          </p>
                          <div className="flex items-center mt-2">
                            <button
                              onClick={() => handleMoveToCart(item.id)}
                              disabled={actionLoading === `move-${item.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                            >
                              {actionLoading === `move-${item.id}` ? (
                                <>
                                  <i className="fas fa-spinner fa-spin mr-1"></i>{" "}
                                  Memindahkan...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-cart-plus mr-1"></i>{" "}
                                  Pindah ke Keranjang
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRemoveFromSaved(item.id)}
                              disabled={
                                actionLoading === `removeSaved-${item.id}`
                              }
                              className="text-red-600 hover:text-red-700 text-sm font-medium ml-4 disabled:opacity-50"
                            >
                              {actionLoading === `removeSaved-${item.id}` ? (
                                <>
                                  <i className="fas fa-spinner fa-spin mr-1"></i>{" "}
                                  Menghapus...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-trash mr-1"></i> Hapus
                                </>
                              )}
                            </button>
                          </div>
                        </div>
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
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Ringkasan Belanja
              </h2>

              {/* Coupon Section */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-ticket-alt mr-2 text-blue-600"></i>
                  Kode Kupon
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-sm text-green-600">
                        {appliedCoupon.description}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      disabled={actionLoading === "removeCoupon"}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {actionLoading === "removeCoupon" ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-times"></i>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase())
                        }
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleApplyCoupon()
                        }
                        placeholder="Masukkan kode kupon"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        disabled={actionLoading === "applyCoupon"}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={actionLoading === "applyCoupon"}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === "applyCoupon" ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          "Pakai"
                        )}
                      </button>
                    </div>
                    {couponMessage && (
                      <p
                        className={`text-sm mt-2 ${
                          couponError ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {couponMessage}
                      </p>
                    )}

                    {/* Available Coupons */}
                    {availableCoupons.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">
                          Kupon tersedia:
                        </p>
                        <div className="space-y-1">
                          {availableCoupons.slice(0, 3).map((coupon) => (
                            <button
                              key={coupon.code}
                              onClick={() => setCouponInput(coupon.code)}
                              className="w-full text-left text-xs bg-gray-50 hover:bg-gray-100 p-2 rounded transition"
                            >
                              <span className="font-medium text-blue-600">
                                {coupon.code}
                              </span>
                              {" - "}
                              <span className="text-gray-600">
                                {coupon.discount_type === "percentage"
                                  ? `${coupon.discount_value}% off`
                                  : `Rp ${coupon.discount_value.toLocaleString(
                                      "id-ID"
                                    )} off`}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon</span>
                    <span>- Rp {discount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Pajak (10%)</span>
                  <span>Rp {tax.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-800">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || actionLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {cart.length === 0 ? (
                  "Keranjang Kosong"
                ) : (
                  <>
                    <i className="fas fa-lock mr-2"></i>
                    Lanjutkan Pembayaran
                  </>
                )}
              </button>

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="block text-center text-blue-600 hover:text-blue-700 mt-4"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        message={alertState.message}
        type={alertState.type}
        title={alertState.title}
      />

      {/* Clear Cart Confirm Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearCart}
        title="Hapus Semua Produk?"
        message="Apakah Anda yakin ingin menghapus semua produk dari keranjang? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus Semua"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default Cart;
