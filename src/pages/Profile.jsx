import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    photo: "",
  });
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0,
  });
  const [photoPreview, setPhotoPreview] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load user data and statistics
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        photo: user.photo || "",
      });
      setPhotoPreview(user.photo || "");

      // Calculate statistics from order history
      const orderHistory = JSON.parse(
        localStorage.getItem("order_history") || "[]"
      );
      const userOrders = orderHistory.filter(
        (order) => order.userId === user.id
      );

      const stats = {
        totalOrders: userOrders.length,
        completedOrders: userOrders.filter(
          (order) => order.status === "delivered"
        ).length,
        totalSpent: userOrders.reduce(
          (sum, order) => sum + (order.total || 0),
          0
        ),
      };
      setStatistics(stats);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          photo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
      setSuccessMessage("Profil berhasil diperbarui!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      photo: user.photo || "",
    });
    setPhotoPreview(user.photo || "");
    setIsEditing(false);
  };

  const getProfileImage = () => {
    if (photoPreview) return photoPreview;
    if (user?.photo) return user.photo;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User"
    )}&background=3b82f6&color=fff&size=200&rounded=true`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Profil Saya</h1>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            {successMessage}
          </div>
        )}

        {/* Account Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Pesanan</p>
                <p className="text-3xl font-bold text-gray-800">
                  {statistics.totalOrders}
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <i className="fas fa-shopping-bag text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pesanan Selesai</p>
                <p className="text-3xl font-bold text-gray-800">
                  {statistics.completedOrders}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <i className="fas fa-check-circle text-2xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Belanja</p>
                <p className="text-3xl font-bold text-gray-800">
                  Rp {statistics.totalSpent.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <i className="fas fa-wallet text-2xl text-purple-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          {!isEditing ? (
            // View Mode
            <>
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
                <img
                  src={getProfileImage()}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {user?.name}
                  </h2>
                  <p className="text-gray-600 mb-1">
                    <i className="fas fa-envelope mr-2"></i>
                    {user?.email}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <i className="fas fa-phone mr-2"></i>
                    {user?.phone || "Belum diisi"}
                  </p>
                  <p className="text-gray-600">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    {user?.address || "Belum diisi"}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Profil
                </button>
              </div>
            </>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-center mb-4">
                  <div className="flex flex-col items-center">
                    <img
                      src={getProfileImage()}
                      alt="Profile Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 mb-3 cursor-pointer hover:opacity-80 transition"
                    />
                    <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                      <i className="fas fa-camera mr-2"></i>
                      Ubah Foto Profil
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-user mr-2 text-blue-600"></i>
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-envelope mr-2 text-blue-600"></i>
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email tidak dapat diubah
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-phone mr-2 text-blue-600"></i>
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="08123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-map-marker-alt mr-2 text-blue-600"></i>
                    Alamat Lengkap
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jl. Contoh No. 123, Jakarta"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-2">
                    Alamat lengkap akan digunakan untuk keperluan pengiriman dan verifikasi
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  <i className="fas fa-save mr-2"></i>
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                >
                  <i className="fas fa-times mr-2"></i>
                  Batal
                </button>
              </div>
            </form>
          )}

          {!isEditing && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                to="/"
                className="inline-block bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-all"
              >
                <i className="fas fa-home mr-2"></i>
                Kembali ke Beranda
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
