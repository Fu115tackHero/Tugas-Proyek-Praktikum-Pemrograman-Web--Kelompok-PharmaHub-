import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    getCartTotal,
    getDiscountAmount,
    appliedCoupon,
    availableCoupons,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    paymentMethod: "midtrans_online", // 'midtrans_online' atau 'bayar_ditempat'
  });

  const [loading, setLoading] = useState(false);

  // Isi data pengguna jika sudah login
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Perhitungan Biaya (Tanpa Biaya Kirim)
  const subtotal = getCartTotal();
  const discount = getDiscountAmount();
  const tax = Math.round(subtotal * 0.1); // Pajak 10% (contoh)
  const total = subtotal + tax - discount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderId = `PHARMAHUB-PICKUP-${Date.now()}`;
    let orderStatus = "";
    let alertMessage = "";

    if (formData.paymentMethod === "bayar_ditempat") {
      // --- LOGIKA UNTUK BAYAR DI TEMPAT ---
      console.log("Pesanan 'Bayar di Tempat' dibuat.");
      orderStatus = "Menunggu Pengambilan (Bayar di Tempat)";
      alertMessage =
        "Pesanan Anda telah dikonfirmasi! Silakan ambil dan bayar di kasir apotek.";

      // Simulasi sukses langsung
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // --- SIMPAN RIWAYAT PESANAN UNTUK BAYAR DI TEMPAT ---
      const orderHistory = JSON.parse(
        localStorage.getItem("order_history") || "[]"
      );
      const newOrder = {
        id: orderId,
        customerName: formData.name,
        customerPhone: formData.phone,
        date: new Date().toISOString(),
        items: cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: total,
        status: orderStatus,
        notes: formData.notes || "",
        paymentMethod: formData.paymentMethod,
        userId: user?.id || "guest",
        discount: discount,
        couponCode: appliedCoupon || null,
      };
      localStorage.setItem(
        "order_history",
        JSON.stringify([...orderHistory, newOrder])
      );

      // Simpan untuk admin OrderManagement
      const adminOrders = JSON.parse(
        localStorage.getItem("adminOrders") || "[]"
      );
      const adminOrder = {
        id: orderId,
        customerName: formData.name,
        customerPhone: formData.phone,
        date: new Date().toISOString(),
        status: "pending",
        total: total,
        items: cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        notes: formData.notes || "",
      };
      localStorage.setItem(
        "adminOrders",
        JSON.stringify([...adminOrders, adminOrder])
      );

      setLoading(false);
      alert(alertMessage);
      clearCart();
      navigate("/history");
      return; // Exit early untuk bayar di tempat
    } else {
      // --- LOGIKA UNTUK MIDTRANS (ONLINE) ---
      console.log("Memulai proses pembayaran online dengan Midtrans...");

      // 1. Kumpulkan data untuk Midtrans
      const transactionDetails = {
        order_id: orderId,
        gross_amount: total,
      };

      const customerDetails = {
        first_name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      const itemDetails = cart.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      }));

      // Menambahkan diskon jika ada
      if (discount > 0) {
        itemDetails.push({
          id: "DISCOUNT",
          price: -discount,
          quantity: 1,
          name: `Diskon (${appliedCoupon})`,
        });
      }

      // Menambahkan pajak sebagai item terpisah
      itemDetails.push({
        id: "TAX",
        price: tax,
        quantity: 1,
        name: "Pajak (PPN 10%)",
      });

      // Data lengkap yang akan dikirim ke backend
      const midtransPayload = {
        transaction_details: transactionDetails,
        customer_details: customerDetails,
        item_details: itemDetails,
      };

      try {
        // Panggil backend API untuk membuat transaksi
        const response = await fetch("/api/create-transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(midtransPayload),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Gagal membuat transaksi");
        }

        // Dapatkan token dari backend
        const snapToken = result.token;

        // Cek apakah demo mode
        if (result.demo_mode) {
          console.log("⚠️  Demo Mode Detected - Simulating Payment");

          // Simulasi pemilihan hasil pembayaran
          const simulatePayment = () => {
            return new Promise((resolve) => {
              // Show custom dialog untuk simulasi
              const paymentResult = window.confirm(
                "🔧 DEMO MODE - Simulasi Pembayaran\n\n" +
                  "Klik OK untuk simulasi pembayaran BERHASIL\n" +
                  "Klik Cancel untuk simulasi pembayaran PENDING"
              );

              setTimeout(() => {
                resolve(paymentResult ? "success" : "pending");
              }, 1000);
            });
          };

          const status = await simulatePayment();

          if (status === "success") {
            // Simulasi sukses
            console.log("✅ Simulated payment success");

            const orderHistory = JSON.parse(
              localStorage.getItem("order_history") || "[]"
            );
            const newOrder = {
              id: orderId,
              customerName: formData.name,
              customerPhone: formData.phone,
              date: new Date().toISOString(),
              items: cart.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
              total: total,
              status: "Lunas (Menunggu Pengambilan)",
              notes: formData.notes || "",
              paymentMethod: formData.paymentMethod,
              userId: user?.id || "guest",
              discount: discount,
              couponCode: appliedCoupon || null,
              paymentDetails: { demo: true, status: "success" },
            };
            localStorage.setItem(
              "order_history",
              JSON.stringify([...orderHistory, newOrder])
            );

            const adminOrders = JSON.parse(
              localStorage.getItem("adminOrders") || "[]"
            );
            const adminOrder = {
              id: orderId,
              customerName: formData.name,
              customerPhone: formData.phone,
              date: new Date().toISOString(),
              status: "paid",
              total: total,
              items: cart.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
              notes: formData.notes || "",
            };
            localStorage.setItem(
              "adminOrders",
              JSON.stringify([...adminOrders, adminOrder])
            );

            clearCart();
            alert("✅ Pembayaran berhasil! (Demo Mode)");
            navigate("/history");
          } else {
            // Simulasi pending
            console.log("⏳ Simulated payment pending");

            const orderHistory = JSON.parse(
              localStorage.getItem("order_history") || "[]"
            );
            const newOrder = {
              id: orderId,
              customerName: formData.name,
              customerPhone: formData.phone,
              date: new Date().toISOString(),
              items: cart.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
              total: total,
              status: "Menunggu Pembayaran",
              notes: formData.notes || "",
              paymentMethod: formData.paymentMethod,
              userId: user?.id || "guest",
              discount: discount,
              couponCode: appliedCoupon || null,
              paymentDetails: { demo: true, status: "pending" },
            };
            localStorage.setItem(
              "order_history",
              JSON.stringify([...orderHistory, newOrder])
            );

            const adminOrders = JSON.parse(
              localStorage.getItem("adminOrders") || "[]"
            );
            const adminOrder = {
              id: orderId,
              customerName: formData.name,
              customerPhone: formData.phone,
              date: new Date().toISOString(),
              status: "pending",
              total: total,
              items: cart.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
              notes: formData.notes || "",
            };
            localStorage.setItem(
              "adminOrders",
              JSON.stringify([...adminOrders, adminOrder])
            );

            clearCart();
            alert("⏳ Pembayaran pending! (Demo Mode)");
            navigate("/history");
          }

          setLoading(false);
          return;
        }

        // REAL MIDTRANS: Panggil Midtrans Snap
        window.snap.pay(snapToken, {
          onSuccess: function (result) {
            console.log("Payment success:", result);

            // Simpan order sebagai Lunas
            const orderHistory = JSON.parse(
              localStorage.getItem("order_history") || "[]"
            );
            const newOrder = {
              id: orderId,
              customerName: formData.name,
              customerPhone: formData.phone,
              date: new Date().toISOString(),
              items: cart.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
              total: total,
              status: "Lunas (Menunggu Pengambilan)",
              notes: formData.notes || "",
              paymentMethod: formData.paymentMethod,
              userId: user?.id || "guest",
              discount: discount,
              couponCode: appliedCoupon || null,
              paymentDetails: result,
            };
            localStorage.setItem(
              "order_history",
              JSON.stringify([...orderHistory, newOrder])
            );

            // Simpan untuk admin
            const adminOrders = JSON.parse(
              localStorage.getItem("adminOrders") || "[]"
            );
            const adminOrder = {
              id: orderId,
              customerName: formData.name,
              customerPhone: formData.phone,
              date: new Date().toISOString(),
              status: "paid",
              total: total,
              items: cart.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
              notes: formData.notes || "",
            };
            localStorage.setItem(
              "adminOrders",
              JSON.stringify([...adminOrders, adminOrder])
            );

            clearCart();
            navigate("/history");
          },
          onPending: function (result) {
            console.log("Payment pending:", result);

            // Simpan order sebagai Pending
            const orderHistory = JSON.parse(
              localStorage.getItem("order_history") || "[]"
            );
            const newOrder = {
              id: orderId,
              customerName: formData.name,
              customerPhone: formData.phone,
              date: new Date().toISOString(),
              items: cart.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
              total: total,
              status: "Menunggu Pembayaran",
              notes: formData.notes || "",
              paymentMethod: formData.paymentMethod,
              userId: user?.id || "guest",
              discount: discount,
              couponCode: appliedCoupon || null,
              paymentDetails: result,
            };
            localStorage.setItem(
              "order_history",
              JSON.stringify([...orderHistory, newOrder])
            );

            // Simpan untuk admin
            const adminOrders = JSON.parse(
              localStorage.getItem("adminOrders") || "[]"
            );
            const adminOrder = {
              id: orderId,
              customerName: formData.name,
              customerPhone: formData.phone,
              date: new Date().toISOString(),
              status: "pending",
              total: total,
              items: cart.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
              notes: formData.notes || "",
            };
            localStorage.setItem(
              "adminOrders",
              JSON.stringify([...adminOrders, adminOrder])
            );

            clearCart();
            navigate("/history");
          },
          onError: function (result) {
            console.log("Payment error:", result);
            setLoading(false);
            alert("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: function () {
            console.log("Customer closed the popup without finishing payment");
            setLoading(false);
            alert(
              "Anda menutup halaman pembayaran. Silakan coba lagi jika ingin melanjutkan."
            );
          },
        });
      } catch (error) {
        console.error("Error creating transaction:", error);
        setLoading(false);
        alert(`Gagal memproses pembayaran: ${error.message}`);
      }

      return; // Exit setelah memanggil Snap
    }
  };

  // Teks Tombol Dinamis
  const getButtonText = () => {
    if (loading) return "Memproses...";
    if (formData.paymentMethod === "bayar_ditempat") {
      return "Konfirmasi Pesanan (Bayar di Tempat)";
    }
    return "Lanjut ke Pembayaran Online";
  };

  // Cek jika keranjang kosong
  if (cart.length === 0 && !loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
        <h2 className="text-2xl font-semibold mb-2">Keranjang Anda kosong</h2>
        <p className="text-gray-600 mb-6">
          Anda tidak bisa checkout dengan keranjang kosong.
        </p>
        <Link
          to="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kolom Kiri: Formulir */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Detail Pemesan
              </h2>
              <div className="space-y-5">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Untuk verifikasi pengambilan"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Untuk kirim bukti pembayaran"
                    required
                  />
                </div>

                {/* Nomor Telepon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Untuk notifikasi pesanan siap"
                    required
                  />
                </div>

                {/* Catatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Mohon disiapkan secepatnya, ada resep dokter"
                    rows="3"
                  />
                </div>
              </div>

              {/* Metode Pembayaran */}
              <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-6">
                Metode Pembayaran
              </h2>
              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="midtrans_online"
                    checked={formData.paymentMethod === "midtrans_online"}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-4 flex-grow">
                    <span className="font-medium text-gray-800">
                      Pembayaran Online
                    </span>
                    <p className="text-sm text-gray-500">
                      Bayar sekarang (E-Wallet, Bank, Kartu Kredit)
                    </p>
                  </div>
                  {/* Logo Pembayaran dari gambar yang kamu berikan */}
                  <div className="ml-auto flex items-center space-x-2 opacity-75">
                    <img
                      src="https://i.ibb.co/L9n30G9/image-89234c.png"
                      alt="Payment Methods"
                      className="h-5"
                    />
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bayar_ditempat"
                    checked={formData.paymentMethod === "bayar_ditempat"}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-4 flex-grow">
                    <span className="font-medium text-gray-800">
                      Bayar di Tempat
                    </span>
                    <p className="text-sm text-gray-500">
                      Bayar tunai atau non-tunai di kasir apotek.
                    </p>
                  </div>
                  <i className="fas fa-store text-xl text-gray-500 ml-auto px-2"></i>
                </label>
              </div>
            </div>

            {/* Kolom Kanan: Ringkasan Pesanan */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-28">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
                  Ringkasan Pesanan
                </h2>

                {/* Daftar Item */}
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Jml: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium">
                        Rp{" "}
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Rincian Biaya */}
                <div className="space-y-3 mt-6 pt-6 border-t">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <div className="flex items-center">
                        <i className="fas fa-tag mr-2 text-sm"></i>
                        <span>Diskon ({appliedCoupon}):</span>
                      </div>
                      <span>-Rp {discount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Pajak (10%):</span>
                    <span>Rp {tax.toLocaleString("id-ID")}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total:</span>
                    <span>Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                  {discount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                      <p className="text-sm text-green-700 text-center">
                        <i className="fas fa-check-circle mr-1"></i>
                        Anda hemat Rp {discount.toLocaleString("id-ID")} dengan
                        kupon ini!
                      </p>
                    </div>
                  )}
                </div>

                {/* Tombol Bayar */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    getButtonText()
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
