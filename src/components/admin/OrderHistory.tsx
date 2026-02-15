import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search } from "lucide-react";
import ReceiptPreview, { type OrderItem } from "./ReceiptPreview";

interface Order {
  id: string;
  order_number: string;
  ticket_code: string | null;
  items: OrderItem[];
  total: number;
  created_at: string;
  payment_method: string;
  amount_paid: number;
}

interface OrderHistoryProps {
  onBack: () => void;
}

const OrderHistory = ({ onBack }: OrderHistoryProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await (supabase.from("orders" as any) as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) setOrders(data as Order[]);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter(o => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.order_number.includes(q) ||
      (o.ticket_code && o.ticket_code.toLowerCase().includes(q)) ||
      o.total.toString().includes(q)
    );
  });

  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-background">
        <ReceiptPreview
          items={selectedOrder.items}
          orderNumber={selectedOrder.order_number}
          ticketCode={selectedOrder.ticket_code || ""}
          total={selectedOrder.total}
          paymentMethod={selectedOrder.payment_method}
          amountPaid={selectedOrder.amount_paid}
          onNewOrder={() => setSelectedOrder(null)}
          newOrderLabel="Retour"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border p-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-bold text-foreground">Historique des commandes</h1>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} résultat(s)</span>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-2 mb-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par n° ou code ticket..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_100px_1fr_120px] gap-0 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/50">
        <span>Réf.</span>
        <span className="text-center">Date</span>
        <span>N° de reçu</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucune commande trouvée</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(order => {
              const date = new Date(order.created_at);
              const dateStr = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
              const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
              return (
                <div
                  key={order.id}
                  className="grid grid-cols-[1fr_100px_1fr_120px] gap-0 items-center px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedOrder(order)}
                >
                  <p className="font-bold text-foreground text-sm">MM-{order.order_number}</p>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{dateStr}</p>
                    <p className="text-xs text-muted-foreground">{timeStr}</p>
                  </div>
                  <p className="text-sm text-foreground truncate">{order.ticket_code || "—"}</p>
                  <p className="font-bold text-foreground text-sm text-right">{order.total.toLocaleString()} CFA</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
