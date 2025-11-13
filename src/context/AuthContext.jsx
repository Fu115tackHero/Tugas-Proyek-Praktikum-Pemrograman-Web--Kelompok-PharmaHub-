import { createContext, useContext, useState, useEffect } from 'react';

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

  // Initialize demo accounts on first load
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('pharmahub_users') || '[]');
    
    // Create demo accounts if they don't exist
    if (users.length === 0) {
      const demoAccounts = [
        {
          id: 1,
          name: 'Demo Customer',
          email: 'customer@pharmahub.com',
          password: 'customer123',
          phone: '081234567890',
          address: 'Jl. Demo Customer No. 123, Jakarta',
          role: 'customer',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Demo Admin',
          email: 'admin@pharmahub.com',
          password: 'admin123',
          phone: '081234567891',
          address: 'Jl. Demo Admin No. 456, Jakarta',
          role: 'admin',
          createdAt: new Date().toISOString(),
        }
      ];
      localStorage.setItem('pharmahub_users', JSON.stringify(demoAccounts));
      console.log('Demo accounts created successfully!');
    }
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pharmahub_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      }
    }
  }, []);

  // Login function
  const login = (email, password) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('pharmahub_users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        address: foundUser.address,
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('pharmahub_user', JSON.stringify(userData));
      return { success: true };
    }

    return { success: false, message: 'Email atau password salah' };
  };

  // Register function
  const register = (userData) => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('pharmahub_users') || '[]');
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: 'Email sudah terdaftar' };
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString(),
    };

    // Save to users array
    users.push(newUser);
    localStorage.setItem('pharmahub_users', JSON.stringify(users));

    // Auto login after registration
    const userDataToSave = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
    };

    setUser(userDataToSave);
    setIsAuthenticated(true);
    localStorage.setItem('pharmahub_user', JSON.stringify(userDataToSave));

    return { success: true };
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('pharmahub_user');
  };

  // Update user profile
  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('pharmahub_user', JSON.stringify(updatedUser));

    // Also update in users array
    const users = JSON.parse(localStorage.getItem('pharmahub_users') || '[]');
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, ...updatedData } : u
    );
    localStorage.setItem('pharmahub_users', JSON.stringify(updatedUsers));

    return { success: true };
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
