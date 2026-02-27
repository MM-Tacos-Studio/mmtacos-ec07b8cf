import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string; // unique cart item id
  type: "tacos" | "family" | "enterprise";
  name: string;
  image?: string;
  size?: string;
  meatChoice?: string;
  quantity: number;
  unitPrice: number;
  supplements: { id: string; name: string; qty: number; price: number }[];
  // Family/Enterprise specific
  menuQuantity?: number;
  meatDistribution?: { viande: number; poulet: number };
  bonus?: string;
  companyName?: string;
  pricePerMenu?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "mmtacos_cart";

const loadCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) => [...prev, { ...item, id }]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return removeItem(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const totalPrice = items.reduce((sum, item) => {
    if (item.type === "family" || item.type === "enterprise") {
      return sum + item.unitPrice * item.quantity;
    }
    const suppTotal = item.supplements.reduce((s, sup) => s + sup.price * sup.qty, 0);
    return sum + (item.unitPrice + suppTotal) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
