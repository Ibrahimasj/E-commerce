'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '@/types';
import { PROMO_CODES } from '@/data/constants';

interface ToastState {
  show: boolean;
  message: string;
  productName?: string;
  productImage?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  voucherCode: string;
  discountAmount: number;
  applyVoucher: (code: string) => { success: boolean; message: string };
  removeVoucher: () => void;
  toast: ToastState;
  hideToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' });

  // Load cart from LocalStorage on initial client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nusamart_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedVoucher = localStorage.getItem('nusamart_voucher');
      if (storedVoucher) {
        setVoucherCode(storedVoucher);
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('nusamart_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [items, isLoaded]);

  // Recalculate discount whenever subtotal or voucher changes
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  useEffect(() => {
    if (!voucherCode) {
      setDiscountAmount(0);
      return;
    }
    const promo = PROMO_CODES[voucherCode.toUpperCase()];
    if (!promo || subtotal < promo.minSpend) {
      setDiscountAmount(0);
      return;
    }

    if (promo.type === 'percentage') {
      const calculated = (subtotal * promo.value) / 100;
      setDiscountAmount(Math.min(calculated, 50000));
    } else {
      setDiscountAmount(promo.value);
    }
  }, [subtotal, voucherCode]);

  const showToastNotification = (product: Product, quantity = 1) => {
    setToast({
      show: true,
      message: `${quantity}x ${product.name} dimasukkan ke keranjang`,
      productName: product.name,
      productImage: product.image,
    });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product.id === product.id
      );
      if (existingIndex >= 0) {
        const newItems = [...prevItems];
        const newQty = newItems[existingIndex].quantity + quantity;
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: Math.min(newQty, product.stock),
        };
        return newItems;
      } else {
        return [...prevItems, { product, quantity: Math.min(quantity, product.stock) }];
      }
    });

    showToastNotification(product, quantity);
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity: Math.min(quantity, item.product.stock),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setVoucherCode('');
    setDiscountAmount(0);
    try {
      localStorage.removeItem('nusamart_cart');
      localStorage.removeItem('nusamart_voucher');
    } catch (e) {
      console.error(e);
    }
  };

  const applyVoucher = (code: string) => {
    const formatted = code.trim().toUpperCase();
    const promo = PROMO_CODES[formatted];
    if (!promo) {
      return { success: false, message: 'Kode voucher tidak valid atau sudah kedaluwarsa.' };
    }
    if (subtotal < promo.minSpend) {
      return {
        success: false,
        message: `Minimal belanja untuk kode ini adalah Rp ${promo.minSpend.toLocaleString('id-ID')}`,
      };
    }
    setVoucherCode(formatted);
    try {
      localStorage.setItem('nusamart_voucher', formatted);
    } catch (e) {
      console.error(e);
    }
    return { success: true, message: `Voucher ${formatted} berhasil digunakan!` };
  };

  const removeVoucher = () => {
    setVoucherCode('');
    setDiscountAmount(0);
    try {
      localStorage.removeItem('nusamart_voucher');
    } catch (e) {
      console.error(e);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isDrawerOpen,
        setIsDrawerOpen,
        totalItems,
        subtotal,
        voucherCode,
        discountAmount,
        applyVoucher,
        removeVoucher,
        toast,
        hideToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
