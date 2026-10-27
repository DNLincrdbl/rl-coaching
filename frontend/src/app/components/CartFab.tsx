'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';

const POP = { type: 'spring' as const, stiffness: 720, damping: 28, mass: 0.5 };

export default function CartFab() {
  const { count, isOpen, isCheckoutOpen, openCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [pop, setPop] = useState(0);
  const prev = useRef(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (count > prev.current) setPop((n) => n + 1);
    prev.current = count;
  }, [count]);

  if (!mounted) return null;

  const visible = count > 0 && !isOpen && !isCheckoutOpen;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.button
          key="cart-fab"
          type="button"
          onClick={openCart}
          aria-label={`Kosár megnyitása, ${count} tétel`}
          initial={{ opacity: 0, y: 16, scale: 0.72 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.84 }}
          transition={POP}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-6 right-6 z-[180] flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-[0_14px_40px_rgba(0,0,0,0.45)]"
        >
          <motion.span
            key={`icon-${pop}`}
            initial={pop === 0 ? false : { scale: 0.82 }}
            animate={{ scale: 1 }}
            transition={POP}
            className="flex items-center justify-center"
          >
            <FaShoppingCart className="h-5 w-5" />
          </motion.span>
          <motion.span
            key={`count-${count}`}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={POP}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-bold text-white"
          >
            {count}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>,
    document.body,
  );
}
