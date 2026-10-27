'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { formatHuf } from '@/lib/data/products';
import SideDrawer from './SideDrawer';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, count, openCheckout } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <SideDrawer open={isOpen} onClose={closeCart} z={210} title="Kosár">
      {items.length === 0 ? (
        <p className="max-w-xs text-base leading-relaxed text-white/55">
          A kosarad üres. Böngéssz a termékek között és add hozzá kedvenceidet.
        </p>
      ) : (
        <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-white/40">{count} tétel</p>
      )}
      {items.length > 0 && (
        <div className="max-w-xl">
          <ul>
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 border-b border-white/15 py-5">
                {item.image && (
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-white/5">
                    <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-white">{item.name}</h3>
                      <p className="mt-1 text-sm text-white/45">
                        {formatHuf(item.price)}{item.priceSuffix ? ` ${item.priceSuffix}` : ''}
                        {item.type === 'subscription' && ' · előfizetés'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[11px] uppercase tracking-[0.18em] text-white/40 transition hover:text-white"
                      aria-label="Eltávolítás"
                    >
                      Törlés
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    {item.type === 'subscription' ? (
                      <span className="text-sm text-white/45">Havi díj</span>
                    ) : (
                      <div className="flex items-center gap-4 text-white">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="text-lg leading-none text-white/50 transition hover:text-white"
                          aria-label="Kevesebb"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="text-lg leading-none text-white/50 transition hover:text-white"
                          aria-label="Több"
                        >
                          +
                        </button>
                      </div>
                    )}
                    <span className="text-lg font-semibold text-white">{formatHuf(item.price * item.qty)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-end justify-between">
            <span className="text-[11px] uppercase tracking-[0.28em] text-white/40">Részösszeg</span>
            <span className="text-[clamp(2rem,4vw,3.2rem)] font-black leading-none tracking-[-0.04em] text-white">
              {formatHuf(subtotal)}
            </span>
          </div>
          <button
            type="button"
            onClick={openCheckout}
            className="mt-8 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Tovább a fizetéshez
          </button>
          <p className="mt-4 text-sm text-white/40">A fizetéshez bejelentkezés szükséges.</p>
        </div>
      )}
    </SideDrawer>
  );
}
