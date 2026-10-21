"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ADMIN_BROWSER_KEY } from "@/lib/admin-browser";
import type { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "quantity">) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  // Falso mientras las compras están cerradas (salvo en el navegador del administrador).
  canBuy: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "terc-cart";

export function CartProvider({
  children,
  storeOpen = true,
}: {
  children: React.ReactNode;
  storeOpen?: boolean;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [adminBrowser, setAdminBrowser] = useState(false);

  // Recupera el carrito guardado en el navegador.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
      setAdminBrowser(localStorage.getItem(ADMIN_BROWSER_KEY) === "1");
    } catch {
      // Sin acceso al almacenamiento: el carrito parte vacío.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  // Funciones estables para que los componentes puedan usarlas en efectos.
  const setQuantity = useCallback(
    (productId: string, quantity: number) =>
      setItems((prev) =>
        prev
          .map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(Math.max(quantity, 0), i.maxQuantity) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      ),
    [],
  );

  const add = useCallback(
    (item: Omit<CartItem, "quantity">) =>
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: Math.min(i.quantity + 1, i.maxQuantity) }
              : i,
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      }),
    [],
  );

  const remove = useCallback((productId: string) => setQuantity(productId, 0), [setQuantity]);
  const clear = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      canBuy: storeOpen || adminBrowser,
    }),
    [items, add, setQuantity, remove, clear, storeOpen, adminBrowser],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
