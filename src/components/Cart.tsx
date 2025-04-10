'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaTimes, FaTrash } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';

export default function Cart() {
  const { items, removeItem, total, isCartOpen, setIsCartOpen, clearCart } = useCart();

  return (
    <>
      {/* Kosár ikon és számláló */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 bg-white text-[#0A0F1C] rounded-full p-4 shadow-lg hover:scale-110 transition-transform z-50"
      >
        <div className="relative">
          <FaShoppingCart className="w-6 h-6" />
          {items.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {items.length}
            </div>
          )}
        </div>
      </button>

      {/* Kosár oldalpanel */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Háttér overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Kosár panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0A0F1C] border-l border-white/10 shadow-xl z-50 overflow-hidden flex flex-col"
            >
              {/* Fejléc */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Kosár</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              {/* Tartalom */}
              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    A kosár üres
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/5 rounded-xl p-4 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-semibold">
                              {item.name} Coaching
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">
                              {item.features.slice(0, 2).join(', ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">{item.price}</p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-400 transition-colors mt-2"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lábléc */}
              {items.length > 0 && (
                <div className="p-6 border-t border-white/10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-400">Összesen:</span>
                    <span className="text-2xl font-bold text-white">
                      {total.toLocaleString('hu-HU')} Ft
                    </span>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        // TODO: Implement checkout
                        alert('Checkout functionality coming soon!');
                      }}
                      className="w-full bg-white text-[#0A0F1C] py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Tovább a fizetéshez
                    </button>
                    <button
                      onClick={clearCart}
                      className="w-full bg-red-500/10 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-500/20 transition-colors"
                    >
                      Kosár ürítése
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 