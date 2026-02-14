import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash2, LogOut, History, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { posProducts, type PosProduct } from "@/lib/posProducts";
import ReceiptPreview, { type OrderItem } from "@/components/admin/ReceiptPreview";
import OrderHistory from "@/components/admin/OrderHistory";
import CashSession from "@/components/admin/CashSession";

type Screen = "pos" | "receipt" | "history" | "cash";

const AdminPOS = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [screen, setScreen] = useState<Screen>("pos");
  const [orderNumber, setOrderNumber] = useState("001");
  const [loading, setLoading] = useState(false);
  const [sizePickerProduct, setSizePickerProduct] = useState<PosProduct | null>(null);
  const [ticketCode, setTicketCode] = useState("");
  const [cashOpen, setCashOpen] = useState<boolean | null>(null);

  // Check cash session
  const checkCashSession = async () => {
    const { data } = await (supabase.from("cash_sessions" as any) as any)
      .select("id")
      .eq("status", "open")
      .limit(1)
      .maybeSingle();
    setCashOpen(!!data);
  };

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      const { data: roleData } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleData) {
        navigate("/admin/login");
      }
    };
    checkAuth();
    checkCashSession();
  }, [navigate]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return posProducts;
    const q = search.toLowerCase();
    return posProducts.filter(p => p.name.toLowerCase().includes(q));
  }, [search]);

  const total = useMemo(() =>
    orderItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [orderItems]
  );

  const addProduct = (product: PosProduct) => {
    if (product.sizes && product.sizes.length > 0) {
      setSizePickerProduct(product);
      return;
    }
    addItemToOrder(product.id, product.name, product.price);
  };

  const addWithSize = (product: PosProduct, sizeName: string, sizePrice: number) => {
    const itemId = `${product.id}-${sizeName}`;
    const itemName = `${product.name} (${sizeName})`;
    addItemToOrder(itemId, itemName, sizePrice);
    setSizePickerProduct(null);
  };

  const addItemToOrder = (id: string, name: string, price: number) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id, name, qty: 1, price }];
    });
  };

  const removeItem = (id: string) => {
    setOrderItems(prev => prev.filter(i => i.id !== id));
  };

  const handlePayment = async () => {
    if (orderItems.length === 0) return;
    if (!cashOpen) {
      alert("Veuillez ouvrir la caisse avant d'enregistrer une commande.");
      setScreen("cash");
      return;
    }
    setLoading(true);

    try {
      const { data: seqData } = await supabase.rpc("get_next_daily_sequence" as any);
      const seq = (seqData as number) || 1;
      const numStr = seq.toString().padStart(3, "0");

      const { data: { session } } = await supabase.auth.getSession();

      const { data: orderData } = await (supabase.from("orders" as any) as any).insert({
        order_number: numStr,
        daily_sequence: seq,
        items: orderItems,
        subtotal: total,
        tax_rate: 0,
        tax_amount: 0,
        total,
        payment_method: "especes",
        amount_paid: total,
        change_amount: 0,
        created_by: session?.user?.id,
      }).select("ticket_code").single();

      setOrderNumber(numStr);
      setTicketCode(orderData?.ticket_code || "");
      setScreen("receipt");
    } catch (e) {
      console.error("Error saving order:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = () => {
    setOrderItems([]);
    setScreen("pos");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  // HISTORY SCREEN
  if (screen === "history") {
    return <OrderHistory onBack={() => setScreen("pos")} />;
  }

  // CASH SESSION SCREEN
  if (screen === "cash") {
    return <CashSession onBack={() => { checkCashSession(); setScreen("pos"); }} />;
  }

  // RECEIPT SCREEN
  if (screen === "receipt") {
    return (
      <div className="min-h-screen bg-background">
        <ReceiptPreview
          items={orderItems}
          orderNumber={orderNumber}
          ticketCode={ticketCode}
          total={total}
          paymentMethod="especes"
          amountPaid={total}
          onNewOrder={handleNewOrder}
        />
      </div>
    );
  }

  // Loading cash state
  if (cashOpen === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  // Cash closed → force cash screen
  if (!cashOpen) {
    return <CashSession onBack={() => { checkCashSession(); }} />;
  }

  // POS SCREEN
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="bg-card border-b border-border p-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setScreen("history")} className="p-2 text-muted-foreground hover:text-foreground" title="Historique">
            <History className="h-4 w-4" />
          </button>
          <button onClick={() => setScreen("cash")} className="p-2 text-muted-foreground hover:text-foreground" title="Caisse">
            <Lock className="h-4 w-4" />
          </button>
          <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-foreground" title="Déconnexion">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-3 pb-28 lg:pb-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addProduct(product)}
                className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left border border-border"
              >
                <div className="aspect-square overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-1.5">
                  <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">{product.name}</p>
                  <p className="text-xs font-bold text-primary">
                    {product.price.toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Order Panel - desktop sidebar */}
        <div className="hidden lg:flex w-96 bg-card border-l border-border flex-col">
          <div className="flex-1 overflow-y-auto p-3">
            {orderItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-sm">Commencez à ajouter des produits</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orderItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2 bg-muted rounded-lg p-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.price.toLocaleString()} × {item.qty}</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">{(item.price * item.qty).toLocaleString()}</p>
                    <button onClick={() => removeItem(item.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-border p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">{total.toLocaleString()} CFA</span>
            </div>
            <button
              onClick={handlePayment}
              disabled={orderItems.length === 0 || loading || !cashOpen}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? "..." : !cashOpen ? "⚠ Caisse fermée" : "Paiement"}
            </button>
          </div>
        </div>

        {/* Mobile sticky bottom bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 space-y-2 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
          {orderItems.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1 mb-2">
              {orderItems.map(item => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <span className="flex-1 truncate text-foreground">{item.qty}× {item.name}</span>
                  <span className="font-bold text-foreground">{(item.price * item.qty).toLocaleString()}</span>
                  <button onClick={() => removeItem(item.id)} className="p-0.5 text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">{total.toLocaleString()} CFA</span>
          </div>
          <button
            onClick={handlePayment}
            disabled={orderItems.length === 0 || loading || !cashOpen}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? "..." : !cashOpen ? "⚠ Caisse fermée" : "Paiement"}
          </button>
        </div>
      </div>

      {/* Size Picker Modal */}
      {sizePickerProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSizePickerProduct(null)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-foreground mb-1">{sizePickerProduct.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">Choisissez la taille</p>
            <div className="flex gap-3">
              {sizePickerProduct.sizes!.map(size => (
                <button
                  key={size.name}
                  onClick={() => addWithSize(sizePickerProduct, size.name, size.price)}
                  className="flex-1 bg-muted hover:bg-primary hover:text-primary-foreground transition-colors rounded-lg p-4 text-center"
                >
                  <p className="text-lg font-bold">{size.name}</p>
                  <p className="text-sm font-medium">{size.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPOS;
