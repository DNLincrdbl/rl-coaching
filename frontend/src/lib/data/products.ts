// Product catalog primitives for the cart / checkout UI.
// NOTE: This is a UI-only layer. Prices here are display values; a future
// Stripe integration must define the authoritative prices server-side.

export type ProductType = 'subscription' | 'oneoff';

export interface Product {
  id: string;
  name: string;
  /** Amount in HUF (integer forint). */
  price: number;
  type: ProductType;
  /** Optional suffix shown after the price, e.g. "/ hó" or "/ óra". */
  priceSuffix?: string;
  /** Optional image path (public asset). */
  image?: string;
}

export interface CartItem extends Product {
  qty: number;
}

/** Format a HUF amount using the dotted thousands style used across the site (e.g. 7.990 Ft). */
export function formatHuf(amount: number): string {
  return `${amount.toLocaleString('de-DE')} Ft`;
}

/** Parse a Hungarian price string like "3.990 Ft/hó" into an integer (3990). */
export function parseHuf(text: string): number {
  return parseInt(String(text).replace(/[^\d]/g, ''), 10) || 0;
}

/** Line total for a single cart item. */
export function itemTotal(item: CartItem): number {
  return item.price * item.qty;
}
