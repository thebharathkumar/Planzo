import { useState, useEffect, useCallback } from 'react';
import { CartContext } from './contexts';

const CART_KEY = 'planzo_cart';

function loadCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      const cart = JSON.parse(stored);
      // Expire old carts (30 minutes)
      if (cart.expiresAt && new Date(cart.expiresAt) < new Date()) {
        localStorage.removeItem(CART_KEY);
        return null;
      }
      return cart;
    }
  } catch {
    localStorage.removeItem(CART_KEY);
  }
  return null;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    if (cart) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(CART_KEY);
    }
  }, [cart]);

  const addToCart = useCallback((eventId, eventTitle, items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCart({
      eventId,
      eventTitle,
      items,
      total,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart(null);
  }, []);

  const itemCount = cart ? cart.items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

