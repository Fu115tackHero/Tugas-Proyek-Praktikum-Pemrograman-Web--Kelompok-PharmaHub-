const SalesReport = () => {
  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">Laporan Penjualan</h2>
          <p className="text-gray-600">Lihat statistik dan laporan penjualan</p>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="fas fa-chart-bar text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Laporan Penjualan
          </h3>
          <p className="text-gray-600">
            Halaman ini sedang dalam pengembangan
          </p>
        </div>
      </div>
    </>
  );
};

export default SalesReport;
