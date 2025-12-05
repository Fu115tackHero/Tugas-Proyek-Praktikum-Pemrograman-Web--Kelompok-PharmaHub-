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

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = AuthService.getStoredUser();
      const isAuth = AuthService.isAuthenticated();

      if (storedUser && isAuth) {
        setUser({ ...storedUser });
        setIsAuthenticated(true);

        try {
          const response = await AuthService.getProfile();
          if (response.success && response.user) {
            const userData = { ...response.user };
            setUser(userData);
            localStorage.setItem("pharmahub_user", JSON.stringify(userData));
          }
        } catch (error) {
          logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await AuthService.login(email, password);

      if (response.success) {
        const userData = { ...response.user };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("pharmahub_user", JSON.stringify(userData));
        return { success: true };
      }

      return { success: false, message: response.message || "Login gagal" };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Email atau password salah",
      };
    }
  };

  const loginWithGoogle = async (googleCredential) => {
    try {
      const response = await AuthService.loginGoogle(googleCredential);
      if (response.success) {
        const userData = { ...response.user };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("pharmahub_user", JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, message: response.message || "Login Google gagal" };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Login Google gagal",
      };
    }
  };

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
      return {
        success: false,
        message: error.message || "Registrasi gagal. Silakan coba lagi.",
      };
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updatedData) => {
    try {
      if (!user || !user.id) {
        return { success: false, message: "User not logged in" };
      }

      const response = await AuthService.updateProfile(user.id, updatedData);

      if (response.success && response.user) {
        const userData = { ...response.user };
        setUser(userData);
        localStorage.setItem("pharmahub_user", JSON.stringify(userData));
        return { success: true, user: userData };
      }

      return {
        success: false,
        message: response.message || "Gagal update profil",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Gagal update profil. Silakan coba lagi.",
      };
    }
  };

  const getToken = () => localStorage.getItem("pharmahub_token");

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
