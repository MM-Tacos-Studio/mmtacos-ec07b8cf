import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Lock, Unlock, FileText, ChevronRight } from "lucide-react";
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

type View = "main" | "history";

const CashSession = ({ onBack }: CashSessionProps) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [closedSessions, setClosedSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [view, setView] = useState<View>("main");

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

  const fetchClosedSessions = async () => {
    const { data } = await (supabase.from("cash_sessions" as any) as any)
      .select("*")
      .eq("status", "closed")
      .order("closed_at", { ascending: false })
      .limit(50);
    setClosedSessions((data || []) as Session[]);
  };

  useEffect(() => { fetchSession(); fetchClosedSessions(); }, []);

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

    // Fetch orders from this session (between opened_at and now)
    const { data: sessionOrders } = await (supabase.from("orders" as any) as any)
      .select("*")
      .gte("created_at", currentSession.opened_at)
      .order("created_at", { ascending: true });

    const sessionOrdersList = (sessionOrders || []) as any[];
    const sessionSales = sessionOrdersList.reduce((s: number, o: any) => s + (o.total || 0), 0);
    const sessionCount = sessionOrdersList.length;

    // Update session with its own totals
    await (supabase.from("cash_sessions" as any) as any)
      .update({
        closed_at: new Date().toISOString(),
        status: "closed",
        total_sales: sessionSales,
        total_orders: sessionCount,
      })
      .eq("id", currentSession.id);

    // Check if daily PDF already generated today
    const today = new Date().toISOString().split("T")[0];
    const alreadyGenerated = localStorage.getItem(`daily_pdf_${today}`);

    if (!alreadyGenerated) {
      // Fetch ALL orders of the day (00h to 00h)
      const dayStart = `${today}T00:00:00.000Z`;
      const dayEnd = `${today}T23:59:59.999Z`;
      const { data: dailyOrders } = await (supabase.from("orders" as any) as any)
        .select("*")
        .gte("created_at", dayStart)
        .lte("created_at", dayEnd)
        .order("created_at", { ascending: true });

      const dailyList = (dailyOrders || []) as any[];
      const dailyTotal = dailyList.reduce((s: number, o: any) => s + (o.total || 0), 0);

      generateDailyPDF(currentSession, dailyList, dailyTotal);
      localStorage.setItem(`daily_pdf_${today}`, "true");
    }

    setCurrentSession(null);
    setClosing(false);
    fetchClosedSessions();
  };

  const regenerateSessionPDF = async (session: Session) => {
    const startTime = session.opened_at;
    const endTime = session.closed_at || new Date().toISOString();
    const { data: sessionOrders } = await (supabase.from("orders" as any) as any)
      .select("*")
      .gte("created_at", startTime)
      .lte("created_at", endTime)
      .order("created_at", { ascending: true });

    const ordersList = (sessionOrders || []) as any[];
    const totalSales = ordersList.reduce((s: number, o: any) => s + (o.total || 0), 0);
    generateDailyPDF(session, ordersList, totalSales);
  };

  const generateDailyPDF = (session: Session, orders: any[], totalSales: number) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const totalOrders = orders.length;

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

    const totalQty = Object.values(itemAgg).reduce((s, i) => s + i.qty, 0);

    const itemRows = Object.values(itemAgg)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(i => `<tr>
        <td style="padding:6px 16px 6px 32px;border-bottom:1px solid #e5e5e5;">${i.name}</td>
        <td style="padding:6px 16px;border-bottom:1px solid #e5e5e5;text-align:right;">${i.qty.toFixed(1)} Unité(s)</td>
        <td style="padding:6px 16px;border-bottom:1px solid #e5e5e5;text-align:right;">${i.total.toLocaleString()}CFA</td>
      </tr>`)
      .join("");

    const invoiceRows = orders
      .map((o: any, idx: number) => {
        const tc = o.ticket_code || `MM-${o.order_number}`;
        const on = o.order_number || String(idx + 1).padStart(5, "0");
        return `<tr>
          <td style="padding:4px 16px 4px 32px;border-bottom:1px solid #e5e5e5;font-weight:500;">INV/${new Date(o.created_at).getFullYear()}/${String(idx + 1).padStart(5, "0")}</td>
          <td style="padding:4px 16px;border-bottom:1px solid #e5e5e5;">${tc}</td>
          <td style="padding:4px 16px;border-bottom:1px solid #e5e5e5;text-align:right;">${(o.total || 0).toLocaleString()}CFA</td>
        </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html><html><head><title>Récapitulatif ${session.session_code}</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #222; }
  .header { display: flex; align-items: flex-start; gap: 40px; margin-bottom: 8px; }
  .header-left { font-size: 11px; color: #444; line-height: 1.5; }
  .header-left strong { font-size: 13px; color: #000; }
  .header-center { flex: 1; text-align: center; }
  .header-center h1 { font-size: 22px; font-weight: bold; margin-bottom: 6px; }
  .header-center p { font-size: 12px; color: #444; }
  .date-box { text-align: right; margin-bottom: 24px; }
  .date-box span { border: 1px solid #333; padding: 4px 12px; font-size: 12px; }
  .section-header { background: #e5e5e5; padding: 6px 12px; font-weight: bold; font-size: 13px; margin-top: 20px; margin-bottom: 0; }
  table { width: 100%; border-collapse: collapse; }
  .cat-row td { font-weight: bold; padding: 8px 16px; border-bottom: 1px solid #ccc; }
  .total-row td { font-weight: bold; padding: 8px 16px; border-top: 2px solid #333; }
  .sub-section { margin-top: 12px; }
  .sub-section-title { background: #e5e5e5; padding: 6px 12px; font-weight: bold; font-size: 12px; }
  .summary-line { padding: 6px 16px; font-size: 12px; }
  .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 8px; }
</style></head><body>
  <div class="header">
    <div class="header-left">
      <strong>MM TACOS</strong><br/>
      Magnambougou près du marché<br/>
      bamako<br/>
      Mali
    </div>
    <div class="header-center">
      <h1>Récapitulatif quotidien des ventes X</h1>
      <p>ID de session : ${session.session_code}</p>
    </div>
  </div>

  <div class="date-box"><span>À la date du ${dateStr}</span></div>

  <div class="section-header">Ventes</div>
  <table>
    <tr class="cat-row">
      <td>Non catégorisé</td>
      <td style="text-align:right;">${totalQty.toFixed(1)}</td>
      <td style="text-align:right;">${totalSales.toLocaleString()}CFA</td>
    </tr>
    ${itemRows}
    <tr class="total-row">
      <td>Total</td>
      <td style="text-align:right;">${totalQty.toFixed(1)}</td>
      <td style="text-align:right;">${totalSales.toLocaleString()}CFA</td>
    </tr>
  </table>

  <div class="sub-section">
    <div class="sub-section-title">Taxes sur les ventes</div>
    <table>
      <tr><td style="padding:4px 16px 4px 32px;">0%</td><td style="padding:4px 16px;">0CFA</td><td style="padding:4px 16px;text-align:right;">${totalSales.toLocaleString()}CFA</td></tr>
      <tr style="border-top:1px solid #333;"><td style="padding:4px 16px 4px 32px;font-weight:bold;">Total</td><td style="padding:4px 16px;font-weight:bold;">0CFA</td><td style="padding:4px 16px;text-align:right;font-weight:bold;">${totalSales.toLocaleString()}CFA</td></tr>
    </table>
  </div>

  <div class="sub-section">
    <div class="sub-section-title">Paiements</div>
    <table>
      <tr><td style="padding:6px 16px 6px 32px;font-weight:500;">Espèces ${session.session_code}</td><td></td><td style="padding:6px 16px;text-align:right;">${totalSales.toLocaleString()}CFA</td></tr>
    </table>
  </div>

  <div class="section-header" style="margin-top:24px;">Factures clients</div>
  <table>
    ${invoiceRows}
    <tr class="total-row">
      <td>Total</td>
      <td></td>
      <td style="text-align:right;">${totalSales.toLocaleString()}CFA</td>
    </tr>
  </table>

  <div class="sub-section">
    <div class="sub-section-title">Contrôle de session</div>
    <p class="summary-line"><strong>Total : ${totalSales.toLocaleString()}CFA</strong></p>
  </div>

  <div class="sub-section">
    <div class="sub-section-title" style="background:#e5e5e5;">Remises</div>
    <p class="summary-line"><strong>Nombre de remises :</strong> 0</p>
    <p class="summary-line"><strong>Montant des remises :</strong> 0 CFA</p>
  </div>

  <p style="margin-top:16px;padding:6px 16px;"><strong>Nombre de transactions :</strong> ${totalOrders}</p>

  <div class="footer">par Jamaney Production</div>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;

  // SESSION HISTORY VIEW
  if (view === "history") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-card border-b border-border p-3 flex items-center gap-3">
          <button onClick={() => setView("main")} className="p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-foreground">Historique des sessions</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {closedSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune session fermée</p>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[3fr_3fr_2fr_3fr] gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/50">
                <span>Session</span>
                <span className="text-center">Date</span>
                <span className="text-center">Commandes</span>
                <span className="text-right">Total</span>
              </div>
              <div className="divide-y divide-border">
                {closedSessions.map(s => {
                  const openDate = new Date(s.opened_at);
                  const closeDate = s.closed_at ? new Date(s.closed_at) : null;
                  const dateStr = openDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
                  const openTime = openDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                  const closeTime = closeDate ? closeDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—";
                  return (
                    <div
                      key={s.id}
                      className="grid grid-cols-[3fr_3fr_2fr_3fr] gap-2 items-center px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => regenerateSessionPDF(s)}
                    >
                      <p className="font-bold text-foreground text-sm truncate">{s.session_code}</p>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">{dateStr}</p>
                        <p className="text-xs text-muted-foreground">{openTime} → {closeTime}</p>
                      </div>
                      <p className="text-center font-medium text-foreground text-sm">{s.total_orders || 0}</p>
                      <div className="flex items-center justify-end gap-2">
                        <p className="font-bold text-foreground text-sm whitespace-nowrap">{(s.total_sales || 0).toLocaleString()} CFA</p>
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // MAIN VIEW
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
            <p className="text-xs text-muted-foreground">Le récapitulatif PDF quotidien se génère une seule fois par jour</p>
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

      {/* Session history button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => { fetchClosedSessions(); setView("history"); }}
          className="w-full flex items-center justify-between bg-muted hover:bg-muted/80 rounded-lg px-4 py-3 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-foreground text-sm">Historique des sessions</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default CashSession;
