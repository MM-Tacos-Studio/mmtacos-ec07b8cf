import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Lock, Unlock, FileText, ChevronRight, UserCheck, Sun, Moon } from "lucide-react";
import type { OrderItem } from "./ReceiptPreview";

interface CashSessionProps {
  onBack: () => void;
}

interface OperationalDay {
  id: string;
  day_code: string;
  opened_at: string;
  closed_at: string | null;
  status: string;
  total_sales: number;
  total_orders: number;
}

interface Session {
  id: string;
  session_code: string;
  opened_at: string;
  closed_at: string | null;
  status: string;
  total_sales: number;
  total_orders: number;
  operational_day_id: string | null;
  cashier_name: string | null;
}

type View = "main" | "history" | "day-detail";

const CashSession = ({ onBack }: CashSessionProps) => {
  const [currentDay, setCurrentDay] = useState<OperationalDay | null>(null);
  const [currentShift, setCurrentShift] = useState<Session | null>(null);
  const [closedDays, setClosedDays] = useState<OperationalDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [view, setView] = useState<View>("main");
  const [cashierName, setCashierName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [selectedDay, setSelectedDay] = useState<OperationalDay | null>(null);
  const [dayShifts, setDayShifts] = useState<Session[]>([]);

  const fetchState = async () => {
    // Fetch open operational day
    const { data: dayData } = await (supabase.from("operational_days" as any) as any)
      .select("*")
      .eq("status", "open")
      .order("opened_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setCurrentDay(dayData as OperationalDay | null);

    // Fetch current open shift
    if (dayData) {
      const { data: shiftData } = await (supabase.from("cash_sessions" as any) as any)
        .select("*")
        .eq("operational_day_id", dayData.id)
        .eq("status", "open")
        .order("opened_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setCurrentShift(shiftData as Session | null);
    } else {
      setCurrentShift(null);
    }

    setLoading(false);
  };

  const fetchClosedDays = async () => {
    const { data } = await (supabase.from("operational_days" as any) as any)
      .select("*")
      .eq("status", "closed")
      .order("closed_at", { ascending: false })
      .limit(50);
    setClosedDays((data || []) as OperationalDay[]);
  };

  useEffect(() => { fetchState(); fetchClosedDays(); }, []);

  // === OPEN A NEW OPERATIONAL DAY ===
  const openDay = async () => {
    setShowNameInput(true);
  };

  const confirmOpenDay = async () => {
    if (!cashierName.trim()) return;
    setProcessing(true);
    const { data: { session } } = await supabase.auth.getSession();
    const now = new Date();
    const dayCode = `JO-${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,"0")}-${now.getDate().toString().padStart(2,"0")}`;
    
    // Create operational day
    const { data: newDay } = await (supabase.from("operational_days" as any) as any)
      .insert({ day_code: dayCode, opened_by: session?.user?.id, status: "open" })
      .select()
      .single();

    if (newDay) {
      // Create first shift
      const shiftCode = `MM-${now.getFullYear().toString().slice(2)}${(now.getMonth()+1).toString().padStart(2,"0")}${now.getDate().toString().padStart(2,"0")}-${Math.floor(Math.random()*9000+1000)}`;
      await (supabase.from("cash_sessions" as any) as any).insert({
        session_code: shiftCode,
        opened_by: session?.user?.id,
        status: "open",
        operational_day_id: newDay.id,
        cashier_name: cashierName.trim(),
      });
    }

    setCashierName("");
    setShowNameInput(false);
    setProcessing(false);
    await fetchState();
  };

  // === END CURRENT SHIFT (Passation / X de caisse) ===
  const endShift = async () => {
    if (!currentShift || !currentDay) return;
    setProcessing(true);

    const { data: shiftOrders } = await (supabase.from("orders" as any) as any)
      .select("*")
      .gte("created_at", currentShift.opened_at)
      .order("created_at", { ascending: true });

    const ordersList = (shiftOrders || []) as any[];
    const shiftSales = ordersList.reduce((s: number, o: any) => s + (o.total || 0), 0);
    const shiftCount = ordersList.length;

    await (supabase.from("cash_sessions" as any) as any)
      .update({
        closed_at: new Date().toISOString(),
        status: "closed",
        total_sales: shiftSales,
        total_orders: shiftCount,
      })
      .eq("id", currentShift.id);

    // Generate shift X report (petit ticket)
    generateShiftReport(currentShift, ordersList, shiftSales);

    setCurrentShift(null);
    setProcessing(false);
    await fetchState();
  };

  // === START NEW SHIFT (after handoff) ===
  const startNewShift = async () => {
    setShowNameInput(true);
  };

  const confirmNewShift = async () => {
    if (!cashierName.trim() || !currentDay) return;
    setProcessing(true);
    const { data: { session } } = await supabase.auth.getSession();
    const now = new Date();
    const shiftCode = `MM-${now.getFullYear().toString().slice(2)}${(now.getMonth()+1).toString().padStart(2,"0")}${now.getDate().toString().padStart(2,"0")}-${Math.floor(Math.random()*9000+1000)}`;

    await (supabase.from("cash_sessions" as any) as any).insert({
      session_code: shiftCode,
      opened_by: session?.user?.id,
      status: "open",
      operational_day_id: currentDay.id,
      cashier_name: cashierName.trim(),
    });

    setCashierName("");
    setShowNameInput(false);
    setProcessing(false);
    await fetchState();
  };

  // === CLOSE THE FULL DAY (Z de caisse) ===
  const closeDay = async () => {
    if (!currentDay) return;
    setProcessing(true);

    // First close any open shift
    if (currentShift) {
      const { data: shiftOrders } = await (supabase.from("orders" as any) as any)
        .select("*")
        .gte("created_at", currentShift.opened_at)
        .order("created_at", { ascending: true });
      const ordersList = (shiftOrders || []) as any[];
      const shiftSales = ordersList.reduce((s: number, o: any) => s + (o.total || 0), 0);
      await (supabase.from("cash_sessions" as any) as any)
        .update({ closed_at: new Date().toISOString(), status: "closed", total_sales: shiftSales, total_orders: ordersList.length })
        .eq("id", currentShift.id);
    }

    // Fetch ALL orders since day opened
    const { data: dayOrders } = await (supabase.from("orders" as any) as any)
      .select("*")
      .gte("created_at", currentDay.opened_at)
      .order("created_at", { ascending: true });

    const allOrders = (dayOrders || []) as any[];
    const dayTotal = allOrders.reduce((s: number, o: any) => s + (o.total || 0), 0);

    // Fetch all shifts for this day
    const { data: allShifts } = await (supabase.from("cash_sessions" as any) as any)
      .select("*")
      .eq("operational_day_id", currentDay.id)
      .order("opened_at", { ascending: true });

    // Close the operational day
    await (supabase.from("operational_days" as any) as any)
      .update({
        closed_at: new Date().toISOString(),
        status: "closed",
        total_sales: dayTotal,
        total_orders: allOrders.length,
      })
      .eq("id", currentDay.id);

    // Generate full-day Z report PDF
    generateDayPDF(currentDay, (allShifts || []) as Session[], allOrders, dayTotal);

    setCurrentDay(null);
    setCurrentShift(null);
    setProcessing(false);
    fetchClosedDays();
  };

  // === SHIFT X REPORT ===
  const generateShiftReport = (shift: Session, orders: any[], total: number) => {
    const now = new Date();
    const html = `<!DOCTYPE html><html><head><title>X Caisse - ${shift.cashier_name}</title>
<style>
  @page { size: 80mm auto; margin: 5mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: monospace; font-size: 11px; width: 80mm; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .line { border-top: 1px dashed #000; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; padding: 2px 0; }
</style></head><body>
  <div class="center bold" style="font-size:14px;">MM TACOS</div>
  <div class="center">X DE CAISSE - Fin de Service</div>
  <div class="line"></div>
  <div class="row"><span>Caissier :</span><span class="bold">${shift.cashier_name || "—"}</span></div>
  <div class="row"><span>Session :</span><span>${shift.session_code}</span></div>
  <div class="row"><span>Ouverture :</span><span>${new Date(shift.opened_at).toLocaleString("fr-FR")}</span></div>
  <div class="row"><span>Fermeture :</span><span>${now.toLocaleString("fr-FR")}</span></div>
  <div class="line"></div>
  <div class="row"><span>Nb commandes :</span><span class="bold">${orders.length}</span></div>
  <div class="row bold" style="font-size:13px;"><span>TOTAL :</span><span>${total.toLocaleString()} CFA</span></div>
  <div class="line"></div>
  <div class="center" style="margin-top:8px;font-size:9px;">par Jamaney Production</div>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();
  };

  // === DAY Z REPORT PDF ===
  const generateDayPDF = (day: OperationalDay, shifts: Session[], orders: any[], totalSales: number) => {
    const dateStr = new Date(day.opened_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

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

    const itemRows = Object.values(itemAgg).sort((a, b) => a.name.localeCompare(b.name))
      .map(i => `<tr><td style="padding:6px 16px 6px 32px;border-bottom:1px solid #e5e5e5;">${i.name}</td><td style="padding:6px 16px;border-bottom:1px solid #e5e5e5;text-align:right;">${i.qty} Unité(s)</td><td style="padding:6px 16px;border-bottom:1px solid #e5e5e5;text-align:right;">${i.total.toLocaleString()}CFA</td></tr>`)
      .join("");

    const shiftRows = shifts.map(s => {
      const openT = new Date(s.opened_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      const closeT = s.closed_at ? new Date(s.closed_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—";
      return `<tr><td style="padding:4px 16px;">${s.cashier_name || "Caissier"}</td><td style="padding:4px 16px;">${s.session_code}</td><td style="padding:4px 16px;">${openT} → ${closeT}</td><td style="padding:4px 16px;text-align:right;">${(s.total_orders || 0)}</td><td style="padding:4px 16px;text-align:right;font-weight:bold;">${(s.total_sales || 0).toLocaleString()}CFA</td></tr>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><title>Z Caisse - ${day.day_code}</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #222; }
  .header { text-align: center; margin-bottom: 16px; }
  .header h1 { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
  .header p { font-size: 12px; color: #444; }
  .date-box { text-align: right; margin-bottom: 20px; }
  .date-box span { border: 1px solid #333; padding: 4px 12px; font-size: 12px; }
  .section-header { background: #e5e5e5; padding: 6px 12px; font-weight: bold; font-size: 13px; margin-top: 20px; }
  table { width: 100%; border-collapse: collapse; }
  .total-row td { font-weight: bold; padding: 8px 16px; border-top: 2px solid #333; }
  .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 8px; }
</style></head><body>
  <div class="header">
    <p><strong>MM TACOS</strong> — Magnambougou près du marché, Bamako, Mali</p>
    <h1>Z DE CAISSE — Clôture de Journée</h1>
    <p>Journée : ${day.day_code}</p>
  </div>
  <div class="date-box"><span>À la date du ${dateStr}</span></div>

  <div class="section-header">Détail par Service</div>
  <table>
    <tr style="background:#f5f5f5;"><th style="padding:6px 16px;text-align:left;">Caissier</th><th style="padding:6px 16px;text-align:left;">Session</th><th style="padding:6px 16px;text-align:left;">Horaires</th><th style="padding:6px 16px;text-align:right;">Cmd</th><th style="padding:6px 16px;text-align:right;">Total</th></tr>
    ${shiftRows}
    <tr class="total-row"><td colspan="3">Total Journée</td><td style="text-align:right;">${orders.length}</td><td style="text-align:right;">${totalSales.toLocaleString()}CFA</td></tr>
  </table>

  <div class="section-header">Ventes détaillées</div>
  <table>
    ${itemRows}
    <tr class="total-row"><td>Total</td><td style="text-align:right;">${totalQty}</td><td style="text-align:right;">${totalSales.toLocaleString()}CFA</td></tr>
  </table>

  <p style="margin-top:16px;padding:6px 16px;"><strong>Nombre total de transactions :</strong> ${orders.length}</p>
  <div class="footer">par Jamaney Production</div>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();
  };

  // === REGENERATE DAY PDF FROM HISTORY ===
  const regenerateDayPDF = async (day: OperationalDay) => {
    const startTime = day.opened_at;
    const endTime = day.closed_at || new Date().toISOString();

    const { data: dayOrders } = await (supabase.from("orders" as any) as any)
      .select("*")
      .gte("created_at", startTime)
      .lte("created_at", endTime)
      .order("created_at", { ascending: true });

    const { data: dayShiftsData } = await (supabase.from("cash_sessions" as any) as any)
      .select("*")
      .eq("operational_day_id", day.id)
      .order("opened_at", { ascending: true });

    const ordersList = (dayOrders || []) as any[];
    const totalSales = ordersList.reduce((s: number, o: any) => s + (o.total || 0), 0);
    generateDayPDF(day, (dayShiftsData || []) as Session[], ordersList, totalSales);
  };

  const fetchDayDetail = async (day: OperationalDay) => {
    const { data } = await (supabase.from("cash_sessions" as any) as any)
      .select("*")
      .eq("operational_day_id", day.id)
      .order("opened_at", { ascending: true });
    setDayShifts((data || []) as Session[]);
    setSelectedDay(day);
    setView("day-detail");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;

  // === DAY DETAIL VIEW ===
  if (view === "day-detail" && selectedDay) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-card border-b border-border p-3 flex items-center gap-3">
          <button onClick={() => setView("history")} className="p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-bold text-foreground text-sm">{selectedDay.day_code}</h1>
            <p className="text-xs text-muted-foreground">{new Date(selectedDay.opened_at).toLocaleDateString("fr-FR")}</p>
          </div>
          <button onClick={() => regenerateDayPDF(selectedDay)} className="ml-auto p-2 text-primary hover:text-primary/80">
            <FileText className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {dayShifts.map(s => {
            const openTime = new Date(s.opened_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
            const closeTime = s.closed_at ? new Date(s.closed_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "En cours";
            return (
              <div key={s.id} className="bg-card border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span className="font-bold text-foreground">{s.cashier_name || "Caissier"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{s.session_code}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{openTime} → {closeTime}</span>
                  <span className="text-muted-foreground">{s.total_orders || 0} cmd</span>
                  <span className="font-bold text-foreground">{(s.total_sales || 0).toLocaleString()} CFA</span>
                </div>
              </div>
            );
          })}
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Total journée</p>
            <p className="text-xl font-bold text-foreground">{(selectedDay.total_sales || 0).toLocaleString()} CFA</p>
            <p className="text-xs text-muted-foreground">{selectedDay.total_orders || 0} commandes</p>
          </div>
        </div>
      </div>
    );
  }

  // === HISTORY VIEW ===
  if (view === "history") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-card border-b border-border p-3 flex items-center gap-3">
          <button onClick={() => setView("main")} className="p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-foreground">Historique des journées</h1>
        </div>
        <div className="grid grid-cols-4 gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/50">
          <span>Journée</span>
          <span className="text-center">Date</span>
          <span className="text-center">Commandes</span>
          <span className="text-right">Total</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {closedDays.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune journée clôturée</p>
          ) : (
            <div className="divide-y divide-border">
              {closedDays.map(d => {
                const openDate = new Date(d.opened_at);
                const dateStr = openDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
                const openTime = openDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                const closeTime = d.closed_at ? new Date(d.closed_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—";
                return (
                  <div
                    key={d.id}
                    className="grid grid-cols-4 gap-4 items-center px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => fetchDayDetail(d)}
                  >
                    <p className="font-bold text-foreground text-sm truncate">{d.day_code}</p>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">{dateStr}</p>
                      <p className="text-xs text-muted-foreground">{openTime} → {closeTime}</p>
                    </div>
                    <p className="text-center font-medium text-foreground text-sm">{d.total_orders || 0}</p>
                    <div className="flex items-center justify-end gap-2">
                      <p className="font-bold text-foreground text-sm whitespace-nowrap">{(d.total_sales || 0).toLocaleString()} CFA</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // === CASHIER NAME INPUT MODAL ===
  if (showNameInput) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-card border-b border-border p-3 flex items-center gap-3">
          <button onClick={() => { setShowNameInput(false); setCashierName(""); }} className="p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-foreground">{currentDay ? "Nouveau service" : "Ouverture de journée"}</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Nom du caissier</h2>
              <p className="text-sm text-muted-foreground mt-1">Qui prend le service ?</p>
            </div>
            <input
              type="text"
              value={cashierName}
              onChange={e => setCashierName(e.target.value)}
              placeholder="Ex: Moussa, Fatou..."
              className="w-full border border-border rounded-lg px-4 py-3 text-foreground bg-background text-center text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <button
              onClick={currentDay ? confirmNewShift : confirmOpenDay}
              disabled={!cashierName.trim() || processing}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Unlock className="h-4 w-4" />
              {processing ? "En cours..." : "Commencer le service"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === MAIN VIEW ===
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border p-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-bold text-foreground">Gestion de caisse</h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {currentDay && currentShift ? (
          // Shift is open
          <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Unlock className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Caisse ouverte</h2>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium text-foreground">{currentShift.cashier_name}</span> en service
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Journée : {currentDay.day_code}
              </p>
              <p className="text-xs text-muted-foreground">
                Service depuis {new Date(currentShift.opened_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            {/* End shift (handoff) */}
            <button
              onClick={endShift}
              disabled={processing}
              className="w-full bg-amber-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserCheck className="h-4 w-4" />
              {processing ? "En cours..." : "Fin de service (passation)"}
            </button>
            <p className="text-xs text-muted-foreground">Imprime un X de caisse et permet au prochain caissier de prendre le relais</p>

            {/* Close full day */}
            <button
              onClick={closeDay}
              disabled={processing}
              className="w-full bg-destructive text-destructive-foreground py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              {processing ? "Clôture en cours..." : "Clôture de fin de journée"}
            </button>
            <p className="text-xs text-muted-foreground">Génère le Z de caisse avec TOUTES les ventes depuis l'ouverture</p>
          </div>
        ) : currentDay && !currentShift ? (
          // Day is open but no active shift (waiting for new cashier)
          <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <UserCheck className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">En attente de passation</h2>
              <p className="text-sm text-muted-foreground mt-1">La journée {currentDay.day_code} est en cours</p>
              <p className="text-xs text-muted-foreground">Un nouveau caissier doit prendre le relais</p>
            </div>
            <button
              onClick={startNewShift}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <Unlock className="h-4 w-4" />
              Démarrer un nouveau service
            </button>
            <button
              onClick={closeDay}
              disabled={processing}
              className="w-full bg-destructive text-destructive-foreground py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              {processing ? "Clôture en cours..." : "Clôture de fin de journée"}
            </button>
          </div>
        ) : (
          // No day open
          <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Journée fermée</h2>
              <p className="text-sm text-muted-foreground mt-1">Ouvrez une nouvelle journée pour commencer</p>
            </div>
            <button
              onClick={openDay}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Ouvrir la journée
            </button>
          </div>
        )}
      </div>

      {/* History button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => { fetchClosedDays(); setView("history"); }}
          className="w-full flex items-center justify-between bg-muted hover:bg-muted/80 rounded-lg px-4 py-3 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-foreground text-sm">Historique des journées</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default CashSession;
