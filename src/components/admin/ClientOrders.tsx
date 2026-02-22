import { useState, useEffect } from "react";
import { ArrowLeft, Phone, MapPin, Clock, ShoppingBag, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClientOrder {
  id: string;
  order_type: string;
  order_details: any;
  phone: string;
  delivery_type: string;
  delivery_address: string | null;
  total: number;
  status: string;
  created_at: string;
}

interface ClientOrdersProps {
  onBack: () => void;
}

const orderTypeLabels: Record<string, string> = {
  tacos: "🌮 Tacos",
  family: "👨‍👩‍👧‍👦 Menu Familial",
  enterprise: "🏢 Menu Entreprise",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  confirmed: "bg-amber-500",
  completed: "bg-green-500",
  cancelled: "bg-destructive",
};

const statusLabels: Record<string, string> = {
  new: "Nouvelle",
  confirmed: "Confirmée",
  completed: "Terminée",
  cancelled: "Annulée",
};

const ClientOrders = ({ onBack }: ClientOrdersProps) => {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("client_orders" as any) as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      setOrders(data as ClientOrder[]);
    }
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    await (supabase.from("client_orders" as any) as any)
      .update({ status: newStatus })
      .eq("id", orderId);
    fetchOrders();
  };

  const playAlertSound = async () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      await ctx.resume();
      [0, 0.25, 0.5].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = "square";
        gain.gain.value = 0.5;
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.18);
      });
    } catch (e) {
      console.warn("Audio alert failed:", e);
    }
  };

  const showBrowserNotification = (order: ClientOrder) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const type = orderTypeLabels[order.order_type] || "Commande";
      new Notification("🛒 Nouvelle commande !", {
        body: `${type} - ${order.total.toLocaleString()} FCFA\nTel: ${order.phone}`,
        icon: "/favicon.png",
      });
    }
  };

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    fetchOrders();

    // Realtime subscription
    const channel = supabase
      .channel("client-orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "client_orders" },
        (payload: any) => {
          const newOrder = payload.new as ClientOrder;
          setOrders((prev) => [newOrder, ...prev]);
          playAlertSound();
          showBrowserNotification(newOrder);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const renderOrderDetails = (order: ClientOrder) => {
    const details = order.order_details;
    if (!details) return null;

    if (order.order_type === "tacos") {
      return (
        <div className="space-y-1 text-sm">
          <p><strong>{details.quantity}x {details.tacoName}</strong>{details.size ? ` (${details.size})` : ""}</p>
          {details.meatChoice && <p>Viande : {details.meatChoice}</p>}
          {details.supplements?.length > 0 && (
            <p>Suppléments : {details.supplements.map((s: any) => `${s.qty}x ${s.name}`).join(", ")}</p>
          )}
        </div>
      );
    }

    if (order.order_type === "family") {
      return (
        <div className="space-y-1 text-sm">
          <p><strong>{details.menuQuantity} Menus Complets</strong></p>
          <p>Viande: {details.meatDistribution?.viande} | Poulet: {details.meatDistribution?.poulet}</p>
          {details.bonus && <p className="text-green-600">🎁 {details.bonus}</p>}
        </div>
      );
    }

    if (order.order_type === "enterprise") {
      return (
        <div className="space-y-1 text-sm">
          <p><strong>{details.menuQuantity} Menus Entreprise</strong></p>
          {details.companyName && <p>🏢 {details.companyName}</p>}
          <p>Viande: {details.meatDistribution?.viande} | Poulet: {details.meatDistribution?.poulet}</p>
          <p className="text-muted-foreground">{details.pricePerMenu?.toLocaleString()} FCFA/menu</p>
        </div>
      );
    }

    return null;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const newCount = orders.filter((o) => o.status === "new").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Commandes Clients
            {newCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{newCount}</span>
            )}
          </h1>
        </div>
        <button onClick={fetchOrders} className="p-2 hover:bg-muted rounded-lg" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Orders list */}
      <div className="p-3 space-y-3 max-w-2xl mx-auto">
        {loading && orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Chargement...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucune commande client</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              {/* Order header */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${statusColors[order.status] || "bg-muted"}`} />
                      <span className="text-sm font-bold">
                        {orderTypeLabels[order.order_type] || order.order_type}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {order.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(order.created_at)}
                      </span>
                    </div>
                  </div>
                  <span className="text-lg font-extrabold text-primary whitespace-nowrap">
                    {order.total.toLocaleString()} F
                  </span>
                </div>
              </button>

              {/* Expanded details */}
              {expandedOrder === order.id && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                  {renderOrderDetails(order)}

                  {/* Delivery info */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>
                      {order.delivery_type === "livraison"
                        ? `Livraison : ${order.delivery_address}`
                        : "Récupération sur place"}
                    </span>
                  </div>

                  {/* Phone link */}
                  <a
                    href={`tel:${order.phone}`}
                    className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    Appeler {order.phone}
                  </a>

                  {/* Status actions */}
                  {order.status === "new" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(order.id, "confirmed")}
                        className="flex-1 bg-amber-500 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Confirmer
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, "cancelled")}
                        className="flex-1 bg-destructive text-destructive-foreground py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        Annuler
                      </button>
                    </div>
                  )}
                  {order.status === "confirmed" && (
                    <button
                      onClick={() => updateStatus(order.id, "completed")}
                      className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Marquer terminée
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientOrders;
