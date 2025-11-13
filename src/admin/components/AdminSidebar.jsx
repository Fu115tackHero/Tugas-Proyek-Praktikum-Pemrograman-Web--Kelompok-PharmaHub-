import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      logout();
    }
  };

  return (
    <aside className="w-64 bg-blue-800 text-white flex-shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold">PharmaHub Admin</h1>
        <p className="text-blue-200 text-sm">Panel Administrasi Apotek</p>
      </div>
      
      <nav className="mt-6">
        <Link
          to="/admin"
          className={`flex items-center px-6 py-3 transition-colors ${
            isActive('/admin')
              ? 'bg-blue-700 border-r-4 border-blue-400'
              : 'hover:bg-blue-700'
          }`}
        >
          <i className="fas fa-tachometer-alt mr-3"></i>
          Dashboard
        </Link>
        
        <Link
          to="/admin/drugs"
          className={`flex items-center px-6 py-3 transition-colors ${
            isActive('/admin/drugs')
              ? 'bg-blue-700 border-r-4 border-blue-400'
              : 'hover:bg-blue-700'
          }`}
        >
          <i className="fas fa-pills mr-3"></i>
          Manajemen Obat
        </Link>
        
        <Link
          to="/admin/orders"
          className={`flex items-center px-6 py-3 transition-colors ${
            isActive('/admin/orders')
              ? 'bg-blue-700 border-r-4 border-blue-400'
              : 'hover:bg-blue-700'
          }`}
        >
          <i className="fas fa-shopping-cart mr-3"></i>
          Manajemen Pesanan
        </Link>
        
        <Link
          to="/admin/reports"
          className={`flex items-center px-6 py-3 transition-colors ${
            isActive('/admin/reports')
              ? 'bg-blue-700 border-r-4 border-blue-400'
              : 'hover:bg-blue-700'
          }`}
        >
          <i className="fas fa-chart-bar mr-3"></i>
          Laporan Penjualan
        </Link>
        
        <div className="border-t border-blue-700 mt-6 pt-6">
          <div className="px-6 py-3 text-blue-200 text-sm">
            <i className="fas fa-user mr-2"></i>
            <span>{user?.name || 'Admin'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 hover:bg-blue-700 transition-colors w-full text-left"
          >
            <i className="fas fa-sign-out-alt mr-3"></i>
            Logout
          </button>
          <Link
            to="/"
            className="flex items-center px-6 py-3 hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-arrow-left mr-3"></i>
            Kembali ke Website
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
