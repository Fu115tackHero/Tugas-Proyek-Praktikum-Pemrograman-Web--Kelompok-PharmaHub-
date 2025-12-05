import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const CartProvider = ({ children }) => {
  const { user, getToken } = useAuth();
  const token =
    typeof getToken === "function"
      ? getToken()
      : localStorage.getItem("pharmahub_token");
  const [cart, setCart] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function untuk API calls
  const apiCall = async (endpoint, options = {}) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error(`[CartContext] API Error (${endpoint}):`, error.message);
      throw error;
    }
  };

  // Fetch cart from API when user logs in
  useEffect(() => {
    if (user && token) {
      fetchCart();
      fetchSavedForLater();
      fetchAvailableCoupons();
    } else {
      // Clear cart when user logs out
      setCart([]);
      setSavedForLater([]);
      setAppliedCoupon(null);
      setAvailableCoupons([]);
    }
  }, [user, token]);

  // Fetch cart
  const fetchCart = async () => {
    if (!token) return;

    try {
      console.log("[CartContext] Fetching cart...");
      setLoading(true);
      setError(null);

      const response = await apiCall("/cart");

      if (response.success && response.data) {
        setCart(response.data.items || []);
        console.log(
          `[CartContext] ✅ Cart loaded: ${
            response.data.items?.length || 0
          } items`
        );
      }
    } catch (err) {
      console.error("[CartContext] Failed to fetch cart:", err.message);
      setError(err.message);
      // Fallback to empty cart on error
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved for later
  const fetchSavedForLater = async () => {
    if (!token) return;

    try {
      const response = await apiCall("/cart/saved");

      if (response.success && response.data) {
        setSavedForLater(response.data.items || []);
        console.log(
          `[CartContext] ✅ Saved items loaded: ${
            response.data.items?.length || 0
          }`
        );
      }
    } catch (err) {
      console.error("[CartContext] Failed to fetch saved items:", err.message);
      setSavedForLater([]);
    }
  };

  // Fetch available coupons
  const fetchAvailableCoupons = async () => {
    if (!token) return;

    try {
      const response = await apiCall("/coupons");

      if (response.success && response.data) {
        setAvailableCoupons(response.data.coupons || []);
        console.log(
          `[CartContext] ✅ Coupons loaded: ${
            response.data.coupons?.length || 0
          }`
        );
      }
    } catch (err) {
      console.error("[CartContext] Failed to fetch coupons:", err.message);
      setAvailableCoupons([]);
    }
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    if (!token) {
      setError("Please login to add items to cart");
      return { success: false, message: "Please login to add items to cart" };
    }

    try {
      console.log(
        `[CartContext] Adding product ${product.id} to cart (qty: ${quantity})`
      );
      setLoading(true);
      setError(null);

      const response = await apiCall("/cart", {
        method: "POST",
        body: JSON.stringify({
          product_id: product.id || product.product_id,
          quantity,
        }),
      });

      if (response.success && response.data) {
        setCart(response.data.cart || []);
        console.log("[CartContext] ✅ Product added to cart");
        return { success: true, message: "Product added to cart" };
      }
    } catch (err) {
      console.error("[CartContext] Failed to add to cart:", err.message);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!token) return { success: false, message: "Please login" };

    try {
      console.log(`[CartContext] Removing product ${productId} from cart`);
      setLoading(true);

      const response = await apiCall(`/cart/${productId}`, {
        method: "DELETE",
      });

      if (response.success && response.data) {
        setCart(response.data.cart || []);
        console.log("[CartContext] ✅ Product removed from cart");
        return { success: true };
      }
    } catch (err) {
      console.error("[CartContext] Failed to remove from cart:", err.message);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (!token) return { success: false, message: "Please login" };

    try {
      console.log(
        `[CartContext] Updating product ${productId} quantity to ${quantity}`
      );
      setLoading(true);

      const response = await apiCall(`/cart/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });

      if (response.success && response.data) {
        setCart(response.data.cart || []);
        console.log("[CartContext] ✅ Quantity updated");
        return { success: true };
      }
    } catch (err) {
      console.error("[CartContext] Failed to update quantity:", err.message);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!token) return { success: false, message: "Please login" };

    try {
      console.log("[CartContext] Clearing cart");
      setLoading(true);

      const response = await apiCall("/cart", {
        method: "DELETE",
      });

      if (response.success) {
        setCart([]);
        setAppliedCoupon(null);
        console.log("[CartContext] ✅ Cart cleared");
        return { success: true };
      }
    } catch (err) {
      console.error("[CartContext] Failed to clear cart:", err.message);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Save item for later
  const saveForLater = async (productId) => {
    if (!token) return { success: false, message: "Please login" };

    try {
      console.log(`[CartContext] Saving product ${productId} for later`);
      setLoading(true);

      const response = await apiCall("/cart/save-for-later", {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.success && response.data) {
        setCart(response.data.cart || []);
        setSavedForLater(response.data.savedItems || []);
        console.log("[CartContext] ✅ Product saved for later");
        return { success: true };
      }
    } catch (err) {
      console.error("[CartContext] Failed to save for later:", err.message);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Move item back to cart
  const moveToCart = async (productId, quantity = 1) => {
    if (!token) return { success: false, message: "Please login" };

    try {
      console.log(`[CartContext] Moving product ${productId} to cart`);
      setLoading(true);

      const response = await apiCall("/cart/move-to-cart", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, quantity }),
      });

      if (response.success && response.data) {
        setCart(response.data.cart || []);
        setSavedForLater(response.data.savedItems || []);
        console.log("[CartContext] ✅ Product moved to cart");
        return { success: true };
      }
    } catch (err) {
      console.error("[CartContext] Failed to move to cart:", err.message);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Remove from saved for later
  const removeFromSaved = async (productId) => {
    if (!token) return { success: false, message: "Please login" };

    try {
      console.log(`[CartContext] Removing product ${productId} from saved`);
      setLoading(true);

      const response = await apiCall(`/cart/saved/${productId}`, {
        method: "DELETE",
      });

      if (response.success && response.data) {
        setSavedForLater(response.data.savedItems || []);
        console.log("[CartContext] ✅ Product removed from saved");
        return { success: true };
      }
    } catch (err) {
      console.error("[CartContext] Failed to remove from saved:", err.message);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Apply coupon
  const applyCoupon = async (couponCode) => {
    if (!token) {
      return { success: false, message: "Please login to use coupons" };
    }

    if (!couponCode || !couponCode.trim()) {
      return { success: false, message: "Please enter a coupon code" };
    }

    try {
      console.log(`[CartContext] Validating coupon: ${couponCode}`);
      setLoading(true);

      const cartTotal = getCartTotal();

      const response = await apiCall("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({
          coupon_code: couponCode.trim().toUpperCase(),
          cart_total: cartTotal,
        }),
      });

      if (response.success && response.data) {
        setAppliedCoupon({
          code: response.data.coupon.code,
          discountAmount: response.data.discountAmount,
          ...response.data.coupon,
        });
        console.log(
          `[CartContext] ✅ Coupon applied: ${response.data.coupon.code}`
        );
        return {
          success: true,
          message: `Coupon ${response.data.coupon.code} applied!`,
          couponData: response.data.coupon,
        };
      }
    } catch (err) {
      console.error("[CartContext] Coupon validation failed:", err.message);
      // Do NOT set global error for coupon failures; return message for UI toast
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    console.log("[CartContext] ✅ Coupon removed");
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  // Get cart items count
  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Get discount amount
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discountAmount || 0;
  };

  const value = {
    cart,
    savedForLater,
    appliedCoupon,
    availableCoupons,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    saveForLater,
    moveToCart,
    removeFromSaved,
    applyCoupon,
    removeCoupon,
    getCartTotal,
    getCartItemsCount,
    getDiscountAmount,
    fetchCart,
    fetchSavedForLater,
    fetchAvailableCoupons,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
