import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getCart, syncCart } from "../utils/api";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Update currentUserId whenever user changes
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 CartContext: User ID changed to:', user.id);
      setCurrentUserId(user.id);
    } else {
      console.log('🔄 CartContext: User logged out, using guest mode');
      setCurrentUserId(null);
    }
  }, [user?.id]);

  // Get localStorage key berdasarkan user ID
  const getCartKey = () => currentUserId ? `pharmahub_cart_${currentUserId}` : "pharmahub_cart_guest";
  const getSavedForLaterKey = () => currentUserId ? `pharmahub_saved_${currentUserId}` : "pharmahub_saved_guest";
  const getCouponKey = () => currentUserId ? `pharmahub_coupon_${currentUserId}` : "pharmahub_coupon_guest";

  // Daftar kupon yang tersedia
  const availableCoupons = {
    SEHAT10: { discount: 10, type: "percentage", description: "Diskon 10%" },
    SEHAT50K: {
      discount: 50000,
      type: "fixed",
      description: "Diskon Rp 50.000",
    },
    NEWUSER: {
      discount: 15,
      type: "percentage",
      description: "Diskon 15% untuk pengguna baru",
    },
    GRATIS20K: {
      discount: 20000,
      type: "fixed",
      description: "Gratis Rp 20.000",
    },
  };

  // Load cart dari localStorage saat user berubah
  useEffect(() => {
    console.log('� CartContext: Loading cart for user ID:', currentUserId || 'guest');
    
    const cartKey = getCartKey();
    console.log('� CartContext: Using cart key:', cartKey);
    
    const savedCart = localStorage.getItem(cartKey);
    console.log('� CartContext: Saved cart data:', savedCart ? `${JSON.parse(savedCart).length} items` : 'none');
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        console.log('✅ CartContext: Loaded cart with', parsedCart.length, 'items');
        
        // Sync to database jika user logged in
        if (currentUserId && user?.id) {
          console.log('🔄 CartContext: Syncing cart to database...');
          syncCart(user.id, parsedCart).catch(err => {
            console.error('❌ Failed to sync cart to DB:', err);
          });
        }
      } catch (error) {
        console.error("❌ CartContext: Error loading cart from localStorage:", error);
        setCart([]);
      }
    } else {
      console.log('📝 CartContext: No saved cart, starting with empty array');
      setCart([]);
    }

    const savedForLaterKey = getSavedForLaterKey();
    const savedItems = localStorage.getItem(savedForLaterKey);
    if (savedItems) {
      try {
        setSavedForLater(JSON.parse(savedItems));
      } catch (error) {
        console.error("❌ Error loading saved items from localStorage:", error);
        setSavedForLater([]);
      }
    } else {
      setSavedForLater([]);
    }

    const couponKey = getCouponKey();
    const savedCoupon = localStorage.getItem(couponKey);
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (error) {
        console.error("❌ Error loading coupon from localStorage:", error);
        setAppliedCoupon(null);
      }
    } else {
      setAppliedCoupon(null);
    }
  }, [currentUserId]); // Reload saat currentUserId berubah

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartKey = getCartKey();
    console.log(`💾 CartContext: Saving cart (key: ${cartKey}, items: ${cart.length})`);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    
    // Sync to database jika user logged in
    if (currentUserId && user?.id && cart.length > 0) {
      console.log('🔄 CartContext: Syncing cart to database...');
      syncCart(user.id, cart).catch(err => {
        console.error('❌ Failed to sync cart to DB:', err);
      });
    }
  }, [cart, currentUserId]);

  // Save "saved for later" to localStorage whenever it changes
  useEffect(() => {
    const savedForLaterKey = getSavedForLaterKey();
    localStorage.setItem(savedForLaterKey, JSON.stringify(savedForLater));
  }, [savedForLater, currentUserId]);

  // Save applied coupon to localStorage whenever it changes
  useEffect(() => {
    const couponKey = getCouponKey();
    if (appliedCoupon) {
      localStorage.setItem(couponKey, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(couponKey);
    }
  }, [appliedCoupon, currentUserId]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    console.log('🛒 CartContext.addToCart called:', { product: product.name, quantity, userEmail: user?.email });
    
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      let updatedCart;
      if (existingItem) {
        // Update quantity if item already exists
        updatedCart = prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        console.log('✅ Item updated in cart');
      } else {
        // Add new item to cart
        updatedCart = [...prevCart, { ...product, quantity }];
        console.log('✅ Item added to cart');
      }
      
      console.log('💾 New cart state:', updatedCart.length, 'items');
      return updatedCart;
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Get cart totals
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Calculate discount amount
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;

    const subtotal = getCartTotal();
    const couponData = availableCoupons[appliedCoupon];

    if (!couponData) return 0;

    if (couponData.type === "percentage") {
      return Math.round(subtotal * (couponData.discount / 100));
    } else {
      // Fixed discount, tapi tidak boleh lebih dari subtotal
      return Math.min(couponData.discount, subtotal);
    }
  };

  // Apply coupon
  const applyCoupon = (couponCode) => {
    const upperCouponCode = couponCode.toUpperCase().trim();

    if (!upperCouponCode) {
      return { success: false, message: "Masukkan kode kupon" };
    }

    if (!availableCoupons[upperCouponCode]) {
      return { success: false, message: "Kode kupon tidak valid" };
    }

    if (appliedCoupon === upperCouponCode) {
      return { success: false, message: "Kupon sudah diterapkan" };
    }

    const subtotal = getCartTotal();
    if (subtotal === 0) {
      return { success: false, message: "Keranjang kosong" };
    }

    setAppliedCoupon(upperCouponCode);
    return {
      success: true,
      message: `Kupon ${upperCouponCode} berhasil diterapkan!`,
      couponData: availableCoupons[upperCouponCode],
    };
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Move item to "Saved for Later"
  const saveForLater = (productId) => {
    const item = cart.find((item) => item.id === productId);
    if (item) {
      setSavedForLater((prev) => {
        const existingItem = prev.find((i) => i.id === productId);
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
    const item = savedForLater.find((item) => item.id === productId);
    if (item) {
      setCart((prev) => {
        const existingItem = prev.find((i) => i.id === productId);
        if (existingItem) {
          return prev.map((i) =>
            i.id === productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        }
        return [...prev, item];
      });
      setSavedForLater((prev) => prev.filter((i) => i.id !== productId));
    }
  };

  // Remove item from saved for later
  const removeFromSaved = (productId) => {
    setSavedForLater((prev) => prev.filter((item) => item.id !== productId));
  };

  const value = {
    cart,
    savedForLater,
    appliedCoupon,
    availableCoupons,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getDiscountAmount,
    applyCoupon,
    removeCoupon,
    saveForLater,
    moveToCart,
    removeFromSaved,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
