'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShoppingCart, FaTrash, FaPlus, FaMinus, FaLock } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';
import { formatHuf } from '@/lib/data/products';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, count, openCheckout } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock page scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0A0A0C] border-l border-white/10 z-[210] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FaShoppingCart className="text-orange-400" /> Kosár
                {count > 0 && <span className="text-sm text-gray-400">({count})</span>}
              </h2>
              <button onClick={closeCart} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <FaTimes className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rlm-scroll p-5 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <FaShoppingCart className="w-7 h-7 text-gray-600" />
                  </div>
                  <p className="text-gray-400">A kosarad üres.</p>
                  <p className="text-sm text-gray-600 mt-1">Böngéssz a termékek között és add hozzá kedvenceidet.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="rlm-card p-4 flex gap-3">
                    {item.image && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                        <Image src={item.image} alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500">
                            {formatHuf(item.price)}{item.priceSuffix ? ` ${item.priceSuffix}` : ''}
                            {item.type === 'subscription' && ' · előfizetés'}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors flex-shrink-0"
                          aria-label="Eltávolítás"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {item.type === 'subscription' ? (
                          <span className="text-xs text-gray-500">Havi díj</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300"
                              aria-label="Kevesebb"
                            >
                              <FaMinus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-8 text-center text-sm text-white">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300"
                              aria-label="Több"
                            >
                              <FaPlus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                        <span className="text-sm font-bold text-white">{formatHuf(item.price * item.qty)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-white/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Részösszeg</span>
                  <span className="text-xl font-bold rlm-gradient-text">{formatHuf(subtotal)}</span>
                </div>
                <button
                  onClick={openCheckout}
                  className="w-full rlm-btn-primary py-3 flex items-center justify-center gap-2"
                >
                  <FaLock className="w-3.5 h-3.5" /> Tovább a fizetéshez
                </button>
                <p className="text-center text-xs text-gray-600">
                  A fizetéshez bejelentkezés szükséges.
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
