import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Lock, Unlock, FileText } from "lucide-react";
import type { OrderItem } from "./ReceiptPreview";

interface CashSessionProps {
  onBack: () => void;
}

interface Session {
  id: string;
  session_code: string;
  opened_at: string;
  closed_at: string | null;
  status: string;
  total_sales: number;
  total_orders: number;
}

const CashSession = ({ onBack }: CashSessionProps) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  const fetchSession = async () => {
    const { data } = await (supabase.from("cash_sessions" as any) as any)
      .select("*")
      .eq("status", "open")
      .order("opened_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setCurrentSession(data as Session | null);
    setLoading(false);
  };

  useEffect(() => { fetchSession(); }, []);

  const openCash = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const now = new Date();
    const code = `MM-${now.getFullYear().toString().slice(2)}${(now.getMonth()+1).toString().padStart(2,"0")}${now.getDate().toString().padStart(2,"0")}-${Math.floor(Math.random()*9000+1000)}`;
    
    await (supabase.from("cash_sessions" as any) as any).insert({
      session_code: code,
      opened_by: session?.user?.id,
      status: "open",
    });
    await fetchSession();
  };

  const closeCash = async () => {
    if (!currentSession) return;
    setClosing(true);

    // Fetch today's orders
    const today = new Date().toISOString().split("T")[0];
    const { data: orders } = await (supabase.from("orders" as any) as any)
      .select("*")
      .gte("created_at", currentSession.opened_at)
      .order("created_at", { ascending: true });

    const ordersList = (orders || []) as any[];
    const totalSales = ordersList.reduce((s: number, o: any) => s + (o.total || 0), 0);
    const totalOrders = ordersList.length;

    // Update session
    await (supabase.from("cash_sessions" as any) as any)
      .update({
        closed_at: new Date().toISOString(),
        status: "closed",
        total_sales: totalSales,
        total_orders: totalOrders,
      })
      .eq("id", currentSession.id);

    // Generate PDF
    generateClosingPDF(currentSession, ordersList, totalSales, totalOrders);

    setCurrentSession(null);
    setClosing(false);
  };

  const generateClosingPDF = (session: Session, orders: any[], totalSales: number, totalOrders: number) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

    // Aggregate items
    const itemAgg: Record<string, { name: string; qty: number; total: number }> = {};
    orders.forEach((o: any) => {
      const items = (o.items || []) as OrderItem[];
      items.forEach(item => {
        if (itemAgg[item.name]) {
          itemAgg[item.name].qty += item.qty;
          itemAgg[item.name].total += item.price * item.qty;
        } else {
          itemAgg[item.name] = { name: item.name, qty: item.qty, total: item.price * item.qty };
        }
      });
    });

    const itemRows = Object.values(itemAgg)
      .sort((a, b) => b.total - a.total)
      .map(i => `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee;">${i.name}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:center;">${i.qty}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right;">${i.total.toLocaleString()} CFA</td></tr>`)
      .join("");

    const invoiceRows = orders
      .map((o: any, idx: number) => `<tr><td style="padding:3px 8px;border-bottom:1px solid #eee;">${o.ticket_code || o.order_number}</td><td style="padding:3px 8px;border-bottom:1px solid #eee;text-align:right;">${(o.total || 0).toLocaleString()} CFA</td></tr>`)
      .join("");

    const html = `<!DOCTYPE html><html><head><title>Fermeture ${session.session_code}</title>
<style>
  @page { size: A4; margin: 20mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
  h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
  h2 { font-size: 14px; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #f97316; }
  .header { text-align: center; margin-bottom: 20px; }
  .meta { font-size: 11px; color: #666; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th { background: #f97316; color: white; padding: 6px 8px; text-align: left; font-size: 11px; }
  .total-row { font-weight: bold; background: #fff7ed; }
  .footer { text-align: center; margin-top: 24px; font-size: 10px; color: #999; }
</style></head><body>
  <div class="header">
    <h1>Récapitulatif quotidien des ventes</h1>
    <p><strong>MM TACOS</strong></p>
    <p class="meta">Magnambougou près du marché, Bamako</p>
    <p class="meta">ID de session : ${session.session_code}</p>
    <p class="meta">À la date du ${dateStr}</p>
  </div>

  <h2>Ventes</h2>
  <table>
    <thead><tr><th>Article</th><th style="text-align:center;">Qté</th><th style="text-align:right;">Montant</th></tr></thead>
    <tbody>
      ${itemRows}
      <tr class="total-row"><td style="padding:6px 8px;">Total</td><td style="padding:6px 8px;text-align:center;">${Object.values(itemAgg).reduce((s, i) => s + i.qty, 0)}</td><td style="padding:6px 8px;text-align:right;">${totalSales.toLocaleString()} CFA</td></tr>
    </tbody>
  </table>

  <h2>Paiements</h2>
  <table>
    <tbody>
      <tr><td style="padding:4px 8px;">Espèces ${session.session_code}</td><td style="padding:4px 8px;text-align:right;font-weight:bold;">${totalSales.toLocaleString()} CFA</td></tr>
    </tbody>
  </table>

  <h2>Factures clients</h2>
  <table>
    <thead><tr><th>Ticket</th><th style="text-align:right;">Montant</th></tr></thead>
    <tbody>
      ${invoiceRows}
      <tr class="total-row"><td style="padding:6px 8px;">Total</td><td style="padding:6px 8px;text-align:right;">${totalSales.toLocaleString()} CFA</td></tr>
    </tbody>
  </table>

  <p style="margin-top:12px;"><strong>Nombre de transactions :</strong> ${totalOrders}</p>

  <div class="footer">par Jamaney Production</div>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border p-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-bold text-foreground">Gestion de caisse</h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {currentSession ? (
          <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Unlock className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Caisse ouverte</h2>
              <p className="text-sm text-muted-foreground mt-1">Session : {currentSession.session_code}</p>
              <p className="text-xs text-muted-foreground">
                Ouverte le {new Date(currentSession.opened_at).toLocaleDateString("fr-FR")} à {new Date(currentSession.opened_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <button
              onClick={closeCash}
              disabled={closing}
              className="w-full bg-destructive text-destructive-foreground py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              {closing ? "Fermeture en cours..." : "Fermer la caisse"}
            </button>
            <p className="text-xs text-muted-foreground">Un récapitulatif PDF sera généré automatiquement</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Caisse fermée</h2>
              <p className="text-sm text-muted-foreground mt-1">Ouvrez la caisse pour commencer</p>
            </div>
            <button
              onClick={openCash}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <Unlock className="h-4 w-4" />
              Ouvrir la caisse
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashSession;
