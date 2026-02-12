import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { posProducts, type PosProduct } from "@/lib/posProducts";
import ReceiptPreview, { type OrderItem } from "@/components/admin/ReceiptPreview";

type Screen = "pos" | "payment" | "receipt";

const AdminPOS = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [screen, setScreen] = useState<Screen>("pos");
  const [paymentMethod, setPaymentMethod] = useState("especes");
  const [amountPaid, setAmountPaid] = useState(0);
  const [numpadValue, setNumpadValue] = useState("");
  const [orderNumber, setOrderNumber] = useState("001");
  const [loading, setLoading] = useState(false);

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
    setOrderItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: product.id, name: product.name, qty: 1, price: product.price }];
    });
  };

  const removeItem = (id: string) => {
    setOrderItems(prev => prev.filter(i => i.id !== id));
  };

  const handleNumpad = (val: string) => {
    if (val === "C") {
      setNumpadValue("");
      setAmountPaid(0);
    } else if (val === "⌫") {
      const nv = numpadValue.slice(0, -1);
      setNumpadValue(nv);
      setAmountPaid(parseInt(nv) || 0);
    } else {
      const nv = numpadValue + val;
      setNumpadValue(nv);
      setAmountPaid(parseInt(nv) || 0);
    }
  };

  const quickAmount = (val: number) => {
    const nv = amountPaid + val;
    setAmountPaid(nv);
    setNumpadValue(nv.toString());
  };

  const handlePayment = async () => {
    if (amountPaid < total) return;
    setLoading(true);

    try {
      // Get next sequence
      const { data: seqData } = await supabase.rpc("get_next_daily_sequence" as any);
      const seq = (seqData as number) || 1;
      const numStr = seq.toString().padStart(3, "0");

      const { data: { session } } = await supabase.auth.getSession();

      await (supabase.from("orders" as any) as any).insert({
        order_number: numStr,
        daily_sequence: seq,
        items: orderItems,
        subtotal: total,
        tax_rate: 0,
        tax_amount: 0,
        total,
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        change_amount: Math.max(0, amountPaid - total),
        created_by: session?.user?.id,
      });

      setOrderNumber(numStr);
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
    setAmountPaid(0);
    setNumpadValue("");
    setPaymentMethod("especes");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  // RECEIPT SCREEN
  if (screen === "receipt") {
    return (
      <div className="min-h-screen bg-background">
        <ReceiptPreview
          items={orderItems}
          orderNumber={orderNumber}
          total={total}
          paymentMethod={paymentMethod}
          amountPaid={amountPaid}
          onNewOrder={handleNewOrder}
        />
      </div>
    );
  }

  // PAYMENT SCREEN
  if (screen === "payment") {
    const change = Math.max(0, amountPaid - total);
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between">
          <button onClick={() => setScreen("pos")} className="text-primary font-bold">← Retour</button>
          <h1 className="font-bold text-lg">Paiement</h1>
          <div />
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left - Amount display */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
            <p className="text-6xl font-bold text-foreground">{total.toLocaleString()} <span className="text-2xl">CFA</span></p>
            
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-muted-foreground text-sm">Payé</p>
                <p className="text-2xl font-bold text-primary">{amountPaid.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Restant</p>
                <p className="text-2xl font-bold">{Math.max(0, total - amountPaid).toLocaleString()}</p>
              </div>
            </div>

            {/* Payment methods */}
            <div className="flex gap-2 mt-4">
              {["especes", "wave", "orange"].map(m => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize ${
                    paymentMethod === m ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {m === "especes" ? "💵 Espèces" : m === "wave" ? "📱 Wave" : "📱 Orange Money"}
                </button>
              ))}
            </div>
          </div>

          {/* Right - Numpad + actions */}
          <div className="w-full lg:w-80 bg-card border-l border-border p-4 flex flex-col gap-3">
            {/* Quick amounts */}
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 50].map(v => (
                <button key={v} onClick={() => quickAmount(v * 100)}
                  className="bg-green-100 text-green-800 py-2 rounded-lg font-bold text-sm">
                  +{(v * 100).toLocaleString()}
                </button>
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9","+/-","0","⌫"].map(k => (
                <button
                  key={k}
                  onClick={() => k !== "+/-" ? handleNumpad(k) : null}
                  className={`py-3 rounded-lg font-bold text-lg ${
                    k === "⌫" ? "bg-destructive/20 text-destructive" : "bg-muted text-foreground"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-auto">
              <button
                onClick={() => { setAmountPaid(total); setNumpadValue(total.toString()); }}
                className="w-full bg-muted text-foreground py-2 rounded-lg font-medium text-sm"
              >
                📋 Facture
              </button>
              <button onClick={handleNumpad.bind(null, "C")}
                className="w-full bg-muted text-foreground py-2 rounded-lg font-medium text-sm">
                Client
              </button>
              <button
                onClick={handlePayment}
                disabled={amountPaid < total || loading || orderItems.length === 0}
                className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold text-lg disabled:opacity-50"
              >
                {loading ? "..." : "Paiement"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // POS SCREEN
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Bottom tabs (mobile) / Top bar */}
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
        <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-3">
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
                  <p className="text-xs font-bold text-primary">{product.price.toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Order Panel */}
        <div className="w-full lg:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border flex flex-col max-h-[50vh] lg:max-h-full">
          {/* Order items */}
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

          {/* Footer */}
          <div className="border-t border-border p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">{total.toLocaleString()} CFA</span>
            </div>
            <button
              onClick={() => { if (orderItems.length > 0) setScreen("payment"); }}
              disabled={orderItems.length === 0}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold disabled:opacity-50"
            >
              Paiement
            </button>
          </div>
        </div>
      </div>

      {/* Bottom tabs */}
      <div className="bg-card border-t border-border flex">
        <button className="flex-1 py-3 text-center text-sm font-medium text-primary border-t-2 border-primary">
          Caisse
        </button>
        <button className="flex-1 py-3 text-center text-sm font-medium text-muted-foreground">
          Commandes
        </button>
      </div>
    </div>
  );
};

export default AdminPOS;
