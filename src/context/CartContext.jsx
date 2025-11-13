import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pharmahub_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }

    const savedItems = localStorage.getItem('pharmahub_saved_for_later');
    if (savedItems) {
      try {
        setSavedForLater(JSON.parse(savedItems));
      } catch (error) {
        console.error('Error loading saved items from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pharmahub_cart', JSON.stringify(cart));
  }, [cart]);

  // Save "saved for later" to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pharmahub_saved_for_later', JSON.stringify(savedForLater));
  }, [savedForLater]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Get cart totals
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Move item to "Saved for Later"
  const saveForLater = (productId) => {
    const item = cart.find(item => item.id === productId);
    if (item) {
      setSavedForLater(prev => {
        const existingItem = prev.find(i => i.id === productId);
        if (existingItem) {
          return prev;
        }
        return [...prev, item];
      });
      removeFromCart(productId);
    }
  };

  // Move item back to cart
  const moveToCart = (productId) => {
    const item = savedForLater.find(item => item.id === productId);
    if (item) {
      setCart(prev => {
        const existingItem = prev.find(i => i.id === productId);
        if (existingItem) {
          return prev.map(i =>
            i.id === productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        }
        return [...prev, item];
      });
      setSavedForLater(prev => prev.filter(i => i.id !== productId));
    }
  };

  // Remove item from saved for later
  const removeFromSaved = (productId) => {
    setSavedForLater(prev => prev.filter(item => item.id !== productId));
  };

  const value = {
    cart,
    savedForLater,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    saveForLater,
    moveToCart,
    removeFromSaved,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
