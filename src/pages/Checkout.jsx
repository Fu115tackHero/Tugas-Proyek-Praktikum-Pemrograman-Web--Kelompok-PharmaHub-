import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, getCartTotal, getDiscountAmount, appliedCoupon, clearCart } =
    useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    paymentMethod: "midtrans_online", // 'midtrans_online' atau 'bayar_ditempat'
  });

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "success",
    redirectToHistory: false,
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Batal",
    onConfirm: null,
    onCancel: null,
  });

  // Isi data pengguna jika sudah login
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      }));
    }
  }, [user]);

  // Perhitungan Biaya (Tanpa Biaya Kirim)
  const subtotal = getCartTotal();
  const discount = getDiscountAmount();
  const tax = Math.round(subtotal * 0.1); // Pajak 10%
  const total = subtotal + tax - discount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addOrderNotification = (orderId, statusText, orderDetails = null) => {
    try {
      const existingNotifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );

      // Hitung ulang values untuk memastikan akurat
      const calculatedSubtotal = subtotal;
      const calculatedTax = tax;
      const calculatedDiscount = discount;
      const calculatedTotal = total;

      // DEBUG: Log calculated values
      console.log("🔍 [Notification] Calculated prices:", {
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        discount: calculatedDiscount,
        total: calculatedTotal,
        cartLength: cart.length,
        getCartTotal: getCartTotal(),
        getDiscountAmount: getDiscountAmount(),
      });

      const newNotification = {
        id: `NOTIF-${Date.now()}`,
        type: "order",
        orderId,
        status: statusText,
        title: "Status Pesanan",
        message: `Pesanan ${orderId} ${statusText}.`,
        createdAt: new Date().toISOString(),
        read: false,
        // Detail lengkap pesanan untuk preview
        orderDetails: orderDetails || {
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
          subtotal: calculatedSubtotal,
          tax: calculatedTax,
          discount: calculatedDiscount,
          total: calculatedTotal,
          customerName: formData.name,
          customerPhone: formData.phone,
          notes: formData.notes || "",
          adminNotes: "", // Akan diisi admin kemudian
        },
      };

      localStorage.setItem(
        "notifications",
        JSON.stringify([newNotification, ...existingNotifications])
      );
    } catch (error) {
      console.error("Error saving notification:", error);
    }
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, open: false }));
    if (modal.redirectToHistory) {
      setTimeout(() => {
        clearCart();
        navigate("/history");
      }, 300);
    }
  };

  const showModal = (
    title,
    message,
    variant = "success",
    redirectToHistory = false
  ) => {
    // Clear any previous modal first
    setModal({
      open: false,
      title: "",
      message: "",
      variant: "success",
      redirectToHistory: false,
    });

    // Then set new modal after a tiny delay
    setTimeout(() => {
      setModal({
        open: true,
        title,
        message,
        variant,
        redirectToHistory,
      });
    }, 100);
  };

  const openConfirm = ({
    title,
    message,
    confirmText = "OK",
    cancelText = "Batal",
    onConfirm = null,
    onCancel = null,
  }) => {
    setConfirmModal({
      open: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
    });
  };

  const closeConfirm = () => {
    setConfirmModal((prev) => ({ ...prev, open: false }));
  };

  const handleConfirmYes = () => {
    const fn = confirmModal.onConfirm;
    closeConfirm();
    if (typeof fn === "function") fn();
  };

  const handleConfirmNo = () => {
    const fn = confirmModal.onCancel;
    closeConfirm();
    if (typeof fn === "function") fn();
  };

  const saveOrder = (orderId, status, paymentDetails = null) => {
    // Save ke order history
    const orderHistory = JSON.parse(
      localStorage.getItem("order_history") || "[]"
    );
    const newOrder = {
      id: orderId,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      date: new Date().toISOString(),
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      total: total,
      subtotal: subtotal,
      tax: tax,
      discount: discount,
      status: status,
      notes: formData.notes || "",
      paymentMethod: formData.paymentMethod,
      userId: user?.id || "guest",
      couponCode: appliedCoupon || null,
      paymentDetails: paymentDetails,
    };

    // DEBUG: Log order being saved
    console.log("💾 [Order] Saving order to history:", {
      orderId,
      total,
      subtotal,
      tax,
      discount,
      itemCount: cart.length,
    });

    localStorage.setItem(
      "order_history",
      JSON.stringify([...orderHistory, newOrder])
    );

    // Save untuk admin OrderManagement
    const adminOrders = JSON.parse(localStorage.getItem("adminOrders") || "[]");

    // Map status ke admin format
    let adminStatus = "pending";
    let adminPaymentStatus = "unpaid";

    if (status.includes("Lunas") || status.includes("Pembayaran Berhasil")) {
      adminStatus = "paid";
      adminPaymentStatus = "paid";
    } else if (
      status.includes("Menunggu Pembayaran") ||
      status.includes("Pending")
    ) {
      adminStatus = "pending";
      adminPaymentStatus = "unpaid";
    }

    const adminOrder = {
      id: orderId,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      date: new Date().toISOString(),
      status: adminStatus,
      paymentStatus: adminPaymentStatus,
      paymentMethod:
        formData.paymentMethod === "midtrans_online"
          ? "pembayaran_online"
          : "bayar_ditempat",
      total: total,
      items: cart.map((item) => ({
        id: item.id,
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPaymentProcessing(false);

    // Validasi form
    if (!formData.name || !formData.email || !formData.phone) {
      showModal(
        "⚠️ Data Tidak Lengkap",
        "Mohon lengkapi data: nama, email, dan nomor telepon!",
        "error",
        false
      );
      setLoading(false);
      return;
    }

    const orderId = `PHARMAHUB-PICKUP-${Date.now()}`;

    if (formData.paymentMethod === "bayar_ditempat") {
      // ============================================
      // BAYAR DI TEMPAT - SIMPLE FLOW
      // ============================================
      console.log("📌 Pesanan 'Bayar di Tempat' dibuat");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const orderStatus = "Menunggu Pengambilan (Bayar di Tempat)";
      const orderDetails = {
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        total: total,
        customerName: formData.name,
        customerPhone: formData.phone,
        notes: formData.notes || "",
        adminNotes: "",
      };
      saveOrder(orderId, orderStatus);
      addOrderNotification(orderId, orderStatus, orderDetails);

      setLoading(false);
      showModal(
        "✅ Pesanan Dikonfirmasi",
        `Pesanan #${orderId} telah dibuat!\n\nSilakan ambil dan bayar di kasir apotek.\n\nNomor pesanan akan digunakan untuk verifikasi.`,
        "success",
        true
      );
    } else {
      // ============================================
      // MIDTRANS PAYMENT - REAL INTEGRATION
      // ============================================
      console.log("💳 Memulai proses pembayaran...");
      setPaymentProcessing(true);

      try {
        // 1. Siapkan data untuk backend
        const itemDetails = cart.map((item) => ({
          id: String(item.id),
          price: Math.round(item.price),
          quantity: item.quantity,
          name: item.name,
        }));

        // Tambah diskon jika ada
        if (discount > 0) {
          itemDetails.push({
            id: "DISCOUNT",
            price: -Math.round(discount),
            quantity: 1,
            name: `Diskon (${appliedCoupon || "Kupon"})`,
          });
        }

        // Tambah pajak
        itemDetails.push({
          id: "TAX",
          price: Math.round(tax),
          quantity: 1,
          name: "Pajak (PPN 10%)",
        });

        const payload = {
          order_id: orderId,
          gross_amount: total,
          items: itemDetails,
          customer: {
            first_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
          },
        };

        console.log("📤 Mengirim request ke /api/create-transaction", payload);

        // 2. Call backend API
        const response = await fetch("/api/create-transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Gagal membuat transaksi");
        }

        console.log("✅ Token pembayaran diterima");
        console.log("🎟️  Token:", result.token.substring(0, 30) + "...");

        // 3. Cek ketersediaan Payment Popup
        if (!window.snap) {
          throw new Error(
            "Layanan pembayaran belum siap. Muat ulang halaman dan coba lagi."
          );
        }

        setLoading(false);

        // 4. Tampilkan Payment Pop-up dengan callback yang terpisah
        window.snap.pay(result.token, {
          onSuccess: function (transaction) {
            console.log("✅ PAYMENT SUCCESS!", transaction);
            setPaymentProcessing(false);

            const status = "Lunas (Menunggu Pengambilan)";
            const orderDetails = {
              items: cart.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
              })),
              subtotal: subtotal,
              tax: tax,
              discount: discount,
              total: total,
              customerName: formData.name,
              customerPhone: formData.phone,
              notes: formData.notes || "",
              adminNotes: "",
            };
            saveOrder(orderId, status, transaction);
            addOrderNotification(orderId, status, orderDetails);

            showModal(
              "✅ Pembayaran Berhasil!",
              `Pesanan #${orderId} telah dibayar!\n\nSilakan menunggu pesanan disiapkan di apotek.`,
              "success",
              true
            );
          },

          onPending: function (transaction) {
            console.log("⏳ PAYMENT PENDING", transaction);
            setPaymentProcessing(false);

            // Konfirmasi untuk menandai LUNAS setelah memilih metode (mis. QRIS)
            const method = (transaction?.payment_type || "")
              .toString()
              .toUpperCase();

            openConfirm({
              title: "Konfirmasi Pembayaran",
              message: `Metode: ${
                method || "-"
              }\nPesanan #${orderId} telah dibuat.\n\nKlik \"Tandai Lunas\" untuk mengkonfirmasi pembayaran berhasil, atau \"Biarkan Pending\" untuk tetap menunggu pembayaran.`,
              confirmText: "Tandai Lunas",
              cancelText: "Biarkan Pending",
              onConfirm: () => {
                const demoStatus = "Lunas";
                const orderDetails = {
                  items: cart.map((item) => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                  })),
                  subtotal: subtotal,
                  tax: tax,
                  discount: discount,
                  total: total,
                  customerName: formData.name,
                  customerPhone: formData.phone,
                  notes: formData.notes || "",
                  adminNotes: "",
                };
                saveOrder(orderId, demoStatus, transaction);
                addOrderNotification(orderId, demoStatus, orderDetails);
                showModal(
                  "✅ Pembayaran Berhasil!",
                  `Pesanan #${orderId} telah dibayar!\n\nSilakan menunggu pesanan disiapkan di apotek.`,
                  "success",
                  true
                );
              },
              onCancel: () => {
                const pendingStatus = "Menunggu Pembayaran";
                const orderDetails = {
                  items: cart.map((item) => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                  })),
                  subtotal: subtotal,
                  tax: tax,
                  discount: discount,
                  total: total,
                  customerName: formData.name,
                  customerPhone: formData.phone,
                  notes: formData.notes || "",
                  adminNotes: "",
                };
                saveOrder(orderId, pendingStatus, transaction);
                addOrderNotification(orderId, pendingStatus, orderDetails);
                showModal(
                  "⏳ Pembayaran Pending",
                  `Pesanan #${orderId} dibuat dan menunggu pembayaran.\n\nSilakan selesaikan pembayaran untuk melanjutkan.`,
                  "info",
                  true
                );
              },
            });
          },

          onError: function (transaction) {
            console.log("❌ PAYMENT ERROR", transaction);
            setPaymentProcessing(false);

            showModal(
              "❌ Pembayaran Gagal",
              "Pembayaran tidak berhasil diproses. Silakan coba lagi.",
              "error",
              false
            );
          },

          onClose: function () {
            console.log("⏹️ Customer menutup popup pembayaran");
            setPaymentProcessing(false);

            openConfirm({
              title: "Konfirmasi Pembayaran",
              message: `Anda menutup pop-up pembayaran.\n\nKlik \"Tandai Lunas\" untuk mengkonfirmasi pembayaran berhasil, atau \"Biarkan Pending\" untuk menunggu pembayaran.`,
              confirmText: "Tandai Lunas",
              cancelText: "Biarkan Pending",
              onConfirm: () => {
                const demoStatus = "Lunas";
                const orderDetails = {
                  items: cart.map((item) => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                  })),
                  subtotal: subtotal,
                  tax: tax,
                  discount: discount,
                  total: total,
                  customerName: formData.name,
                  customerPhone: formData.phone,
                  notes: formData.notes || "",
                  adminNotes: "",
                };
                saveOrder(orderId, demoStatus);
                addOrderNotification(orderId, demoStatus, orderDetails);
                showModal(
                  "✅ Pembayaran Berhasil!",
                  `Pesanan #${orderId} telah dibayar!\n\nSilakan menunggu pesanan disiapkan di apotek.`,
                  "success",
                  true
                );
              },
              onCancel: () => {
                const pendingStatus = "Menunggu Pembayaran";
                const orderDetails = {
                  items: cart.map((item) => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                  })),
                  subtotal: subtotal,
                  tax: tax,
                  discount: discount,
                  total: total,
                  customerName: formData.name,
                  customerPhone: formData.phone,
                  notes: formData.notes || "",
                  adminNotes: "",
                };
                saveOrder(orderId, pendingStatus);
                addOrderNotification(orderId, pendingStatus, orderDetails);
                showModal(
                  "⏳ Pembayaran Pending",
                  `Pesanan #${orderId} dibuat dan menunggu pembayaran.\n\nSilakan selesaikan pembayaran untuk melanjutkan.`,
                  "info",
                  true
                );
              },
            });
          },
        });
      } catch (error) {
        console.error("❌ Error:", error);
        setLoading(false);
        setPaymentProcessing(false);

        showModal(
          "❌ Gagal Memproses Pembayaran",
          `Error: ${error.message}`,
          "error",
          false
        );
      }
    }
  };

  // Teks Tombol Dinamis
  const getButtonText = () => {
    if (loading) return "Memproses...";
    if (formData.paymentMethod === "bayar_ditempat") {
      return "Konfirmasi Pesanan";
    }
    return "Lanjut ke Pembayaran";
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

                {/* Alamat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat (Opsional)
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Alamat lengkap untuk konfirmasi"
                    rows="2"
                  />
                </div>

                {/* Catatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Pesanan (Opsional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Mohon disiapkan secepatnya"
                    rows="3"
                  />
                </div>
              </div>

              {/* Metode Pembayaran */}
              <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-6">
                Metode Pembayaran
              </h2>
              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="midtrans_online"
                    checked={formData.paymentMethod === "midtrans_online"}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="ml-4 flex-grow">
                    <span className="font-semibold text-gray-800">
                      💳 Pembayaran Online
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      E-Wallet, Bank Transfer, Kartu Kredit, Dana, OVO, GOPAY
                    </p>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bayar_ditempat"
                    checked={formData.paymentMethod === "bayar_ditempat"}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600"
                  />
                  <div className="ml-4 flex-grow">
                    <span className="font-semibold text-gray-800">
                      🏪 Bayar di Tempat
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Tunai atau non-tunai di kasir apotek saat pengambilan
                    </p>
                  </div>
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
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity}x Rp{" "}
                          {item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="text-gray-700 font-semibold text-right ml-2">
                        Rp{" "}
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Rincian Biaya */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Diskon ({appliedCoupon}):</span>
                      <span>-Rp {discount.toLocaleString("id-ID")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Pajak (10%):</span>
                    <span>Rp {tax.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-3 text-center">
                      <p className="text-xs text-green-700">
                        <i className="fas fa-check-circle mr-1"></i>
                        Hemat Rp {discount.toLocaleString("id-ID")}!
                      </p>
                    </div>
                  )}
                </div>

                {/* Tombol Bayar */}
                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-lg font-semibold tracking-wide shadow-sm hover:shadow-md hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
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
                      Memproses...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-credit-card"></i>
                      {getButtonText()}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Pembayaran aman dan terenkripsi
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modal Status */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in">
            <div className="flex items-start mb-4">
              <div
                className={`mt-0.5 mr-4 rounded-full p-3 text-2xl ${
                  modal.variant === "success"
                    ? "bg-green-100 text-green-600"
                    : modal.variant === "error"
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <i
                  className={`fas ${
                    modal.variant === "success"
                      ? "fa-check-circle"
                      : modal.variant === "error"
                      ? "fa-exclamation-circle"
                      : "fa-info-circle"
                  }`}
                ></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">
                  {modal.title}
                </h3>
              </div>
            </div>

            <p className="text-sm text-gray-600 whitespace-pre-line mb-6 leading-relaxed">
              {modal.message}
            </p>

            <button
              type="button"
              onClick={closeModal}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in">
            <div className="flex items-start mb-4">
              <div className="mt-0.5 mr-4 rounded-full p-3 text-2xl bg-amber-100 text-amber-700">
                <i className="fas fa-flask"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">
                  {confirmModal.title}
                </h3>
              </div>
            </div>

            <p className="text-sm text-gray-600 whitespace-pre-line mb-6 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmNo}
                className="w-1/2 bg-gray-100 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                {confirmModal.cancelText || "Batal"}
              </button>
              <button
                type="button"
                onClick={handleConfirmYes}
                className="w-1/2 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                {confirmModal.confirmText || "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
