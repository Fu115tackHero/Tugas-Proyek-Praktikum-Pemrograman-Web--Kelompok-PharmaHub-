import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Layout
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import History from './pages/History';
import Notifications from './pages/Notifications';
import Debug from './pages/Debug';
import ForgetPassword from './pages/Forget-Password'; // <-- TAMBAHKAN INI
import ImageUploadTest from './pages/ImageUploadTest'; // Test upload Supabase
// ... impor lainnya

// Admin
import AdminLayout from './admin/components/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import DrugManagement from './admin/pages/DrugManagement';
import OrderManagement from './admin/pages/OrderManagement';
import SalesReport from './admin/pages/SalesReport';

// Protected Route Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Routes with Layout (Navbar + Footer) */}
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="debug" element={<Debug />} />
              <Route path="test-upload" element={<ImageUploadTest />} />
              <Route path="history" element={<History />} />
              <Route path="notifications" element={<Notifications />} />
              
              {/* Protected Routes */}
              <Route path="cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Route>

            {/* Routes without Layout (No Navbar/Footer) */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forget-password" element={<ForgetPassword />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="drugs" element={<DrugManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="reports" element={<SalesReport />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
