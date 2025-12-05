import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("pharmahub_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }

    const savedItems = localStorage.getItem("pharmahub_saved_for_later");
    if (savedItems) {
      try {
        setSavedForLater(JSON.parse(savedItems));
      } catch (error) {
        console.error("Error loading saved items from localStorage:", error);
      }
    }

    const savedCoupon = localStorage.getItem("pharmahub_applied_coupon");
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (error) {
        console.error("Error loading coupon from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("pharmahub_cart", JSON.stringify(cart));
  }, [cart]);

  // Save "saved for later" to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "pharmahub_saved_for_later",
      JSON.stringify(savedForLater)
    );
  }, [savedForLater]);

  // Save applied coupon to localStorage whenever it changes
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(
        "pharmahub_applied_coupon",
        JSON.stringify(appliedCoupon)
      );
    } else {
      localStorage.removeItem("pharmahub_applied_coupon");
    }
  }, [appliedCoupon]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        // Update quantity if item already exists
        return prevCart.map((item) =>
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
