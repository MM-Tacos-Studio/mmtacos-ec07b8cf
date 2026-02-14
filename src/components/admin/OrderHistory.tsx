import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Printer, Search } from "lucide-react";
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
        .limit(100);
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
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-2 mb-3">
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

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucune commande trouvée</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(order => {
              const date = new Date(order.created_at);
              return (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">#{order.order_number}</span>
                      {order.ticket_code && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{order.ticket_code}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {date.toLocaleDateString("fr-FR")} à {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      {" · "}{(order.items as OrderItem[]).reduce((s, i) => s + i.qty, 0)} article(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{order.total.toLocaleString()} CFA</p>
                    <Printer className="h-4 w-4 text-muted-foreground mt-1 ml-auto" />
                  </div>
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
