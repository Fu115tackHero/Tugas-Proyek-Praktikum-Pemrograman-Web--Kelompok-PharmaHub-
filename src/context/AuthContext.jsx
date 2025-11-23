import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount (for persistent session)
  useEffect(() => {
    const savedUser = localStorage.getItem('pharmahub_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ Loaded user session from localStorage:', userData.email);
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      }
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login via API...');
      console.log('API URL:', import.meta.env.VITE_API_URL);
      
      // Call API
      const response = await apiLogin({ email, password });
      
      console.log('✅ Login API response:', response);
      
      if (response.success) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('pharmahub_user', JSON.stringify(userData));
        return { success: true };
      }
      
      return { success: false, message: response.message || 'Login gagal' };
    } catch (error) {
      console.error('❌ Login API error:', error);
      console.error('Error details:', error.message);
      
      // Show error to user instead of fallback
      return { 
        success: false, 
        message: `Backend API error: ${error.message}. Pastikan backend server running di ${import.meta.env.VITE_API_URL}` 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration via API...');
      console.log('API URL:', import.meta.env.VITE_API_URL);
      console.log('User data:', { ...userData, password: '***' });
      
      // Call API
      const response = await apiRegister(userData);
      
      console.log('✅ Registration API response:', response);
      
      if (response.success) {
        const newUser = response.data;
        
        // Auto login after registration
        const userDataToSave = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role || 'customer',
        };

        setUser(userDataToSave);
        setIsAuthenticated(true);
        localStorage.setItem('pharmahub_user', JSON.stringify(userDataToSave));

        return { success: true };
      }
      
      return { success: false, message: response.message || 'Registrasi gagal' };
    } catch (error) {
      console.error('❌ Registration API error:', error);
      console.error('Error details:', error.message);
      
      // Show error to user instead of fallback
      return { 
        success: false, 
        message: `Backend API error: ${error.message}. Pastikan backend server running di ${import.meta.env.VITE_API_URL}` 
      };
    }
  };

  // Logout function
  const logout = () => {
    // Clear user session
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('pharmahub_user');
    
    // Note: Cart is kept in localStorage even after logout
    // This allows users to continue shopping without losing their cart
  };

  // Update user profile
  const updateProfile = async (updatedData) => {
    try {
      // TODO: Call API to update profile in database
      console.log('⚠️ Update profile API not implemented yet, using localStorage');
      
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem('pharmahub_user', JSON.stringify(updatedUser));

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error.message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
