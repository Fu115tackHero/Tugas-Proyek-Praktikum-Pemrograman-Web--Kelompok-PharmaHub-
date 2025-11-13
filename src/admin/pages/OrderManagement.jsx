const OrderManagement = () => {
  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">Manajemen Pesanan</h2>
          <p className="text-gray-600">Kelola pesanan pelanggan</p>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Manajemen Pesanan
          </h3>
          <p className="text-gray-600">
            Halaman ini sedang dalam pengembangan
          </p>
        </div>
      </div>
    </>
  );
};

export default OrderManagement;
