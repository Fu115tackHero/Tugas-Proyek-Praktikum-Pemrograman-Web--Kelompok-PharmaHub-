import { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../services/auth.service";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = AuthService.getStoredUser();
      const isAuth = AuthService.isAuthenticated();

      if (storedUser && isAuth) {
        setUser(storedUser);
        setIsAuthenticated(true);

        // Optionally verify token with backend
        try {
          await AuthService.getProfile();
        } catch (error) {
          // Token invalid, logout
          console.error("Token verification failed:", error);
          logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await AuthService.login(email, password);

      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, message: response.message || "Login gagal" };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.message || "Email atau password salah",
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await AuthService.register(userData);

      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      }

      return {
        success: false,
        message: response.message || "Registrasi gagal",
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.message || "Registrasi gagal. Silakan coba lagi.",
      };
    }
  };

  // Logout function
  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (updatedData) => {
    try {
      if (!user || !user.id) {
        return { success: false, message: "User not logged in" };
      }

      console.log("🔄 Updating profile for user:", user.id);

      // Call backend API to update profile
      const response = await AuthService.updateProfile(user.id, updatedData);

      if (response.success && response.user) {
        // Update local state with fresh data from server
        setUser(response.user);
        console.log("✅ Profile updated successfully");
        return { success: true, user: response.user };
      }

      return {
        success: false,
        message: response.message || "Gagal update profil",
      };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        message: error.message || "Gagal update profil. Silakan coba lagi.",
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
