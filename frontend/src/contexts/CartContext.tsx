'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { CartItem, Product } from '@/lib/data/products';

const STORAGE_KEY = 'rlm-cart';

interface CartContextType {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  // Cart drawer visibility
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  // Checkout modal visibility
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.price === 'number' &&
    Number.isFinite(v.price) &&
    v.price >= 0 &&
    (v.type === 'subscription' || v.type === 'oneoff') &&
    typeof v.qty === 'number' &&
    Number.isInteger(v.qty) &&
    v.qty > 0 &&
    v.qty <= 99
  );
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem).slice(0, 50);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Hydrate from localStorage on mount (avoids SSR mismatch).
  useEffect(() => {
    setItems(loadCart());
  }, []);

  // Persist on change.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product, qty: number = 1) => {
    setItems((prev) => {
      // Subscriptions are single-quantity; only one subscription allowed at a time.
      if (product.type === 'subscription') {
        const withoutSubs = prev.filter((i) => i.type !== 'subscription' && i.id !== product.id);
        return [...withoutSubs, { ...product, qty: 1 }];
      }
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...product, qty }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.flatMap((i) => {
        if (i.id !== id) return [i];
        if (i.type === 'subscription') return [i]; // subscriptions stay at qty 1
        const next = Math.max(0, qty);
        return next === 0 ? [] : [{ ...i, qty: next }];
      }),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

  const value: CartContextType = {
    items,
    count,
    subtotal,
    addItem,
    removeItem,
    updateQty,
    clear,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    isCheckoutOpen,
    openCheckout: () => { setIsOpen(false); setIsCheckoutOpen(true); },
    closeCheckout: () => setIsCheckoutOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
