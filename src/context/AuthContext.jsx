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
        // Set initial user from localStorage
        setUser({ ...storedUser });
        setIsAuthenticated(true);

        // Fetch fresh user data from backend to sync profile_photo_url
        try {
          const response = await AuthService.getProfile();
          if (response.success && response.user) {
            // Update with fresh data from server (create new object)
            const userData = { ...response.user };
            setUser(userData);
            localStorage.setItem("pharmahub_user", JSON.stringify(userData));
            console.log("✅ User data synced from server");
            console.log("📸 Profile photo URL from server:", userData.profile_photo_url);
          }
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
        console.log("✅ Login successful, user data:", response.user);
        console.log("📸 Profile photo URL:", response.user?.profile_photo_url);
        
        // Create new object to force React re-render
        const userData = { ...response.user };
        
        // Set user state with complete data including profile_photo_url
        setUser(userData);
        setIsAuthenticated(true);
        
        // Force update localStorage to ensure profile_photo_url is saved
        localStorage.setItem("pharmahub_user", JSON.stringify(userData));
        
        console.log("💾 User saved to state and localStorage");
        
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
        // Create new object to force React re-render
        const userData = { ...response.user };
        
        // Update local state with fresh data from server
        setUser(userData);
        
        // Ensure profile_photo_url is saved to localStorage
        localStorage.setItem("pharmahub_user", JSON.stringify(userData));
        
        console.log("✅ Profile updated successfully");
        console.log("📸 New profile photo URL:", userData.profile_photo_url);
        
        return { success: true, user: userData };
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

  // Get authentication token
  const getToken = () => {
    return localStorage.getItem("pharmahub_token");
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
