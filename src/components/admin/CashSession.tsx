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
  const [allDayShifts, setAllDayShifts] = useState<Session[]>([]);
  const [closedDays, setClosedDays] = useState<OperationalDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [view, setView] = useState<View>("main");
  const [showShiftPicker, setShowShiftPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<OperationalDay | null>(null);
  const [dayShifts, setDayShifts] = useState<Session[]>([]);

  const fetchState = async () => {
    // Get open operational day
    const { data: dayData } = await (supabase.from("operational_days" as any) as any)
      .select("*")
      .eq("status", "open")
      .order("opened_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setCurrentDay(dayData as OperationalDay | null);

    if (dayData) {
      // Get open shift for this day
      const { data: shiftData } = await (supabase.from("cash_sessions" as any) as any)
        .select("*")
        .eq("operational_day_id", dayData.id)
        .eq("status", "open")
        .order("opened_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setCurrentShift(shiftData as Session | null);

      // Get ALL shifts for this day (to know how many passations happened)
      const { data: allShifts } = await (supabase.from("cash_sessions" as any) as any)
        .select("*")
        .eq("operational_day_id", dayData.id)
        .order("opened_at", { ascending: true });
      setAllDayShifts((allShifts || []) as Session[]);
    } else {
      setCurrentShift(null);
      setAllDayShifts([]);
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

  // How many shifts have been created for this day?
  const shiftCount = allDayShifts.length;
  // Was there already a passation? (= shift closed + another started, or shift closed and waiting)
  const closedShiftsCount = allDayShifts.filter(s => s.status === "closed").length;
  // Can do passation only if this is the FIRST shift (Matin) and no passation happened yet
  const canDoPassation = currentShift && shiftCount === 1 && closedShiftsCount === 0;
  // Current shift name
  const currentShiftName = currentShift?.cashier_name;
  // What shift comes next after passation
  const nextShiftName = currentShiftName === "Matin" ? "Soir" : "Matin";

  // === OPEN A NEW OPERATIONAL DAY ===
  const openDay = () => {
    setShowShiftPicker(true);
  };

  const confirmOpenDay = async (shift: "Matin" | "Soir") => {
    setProcessing(true);
    const { data: { session } } = await supabase.auth.getSession();
    const now = new Date();
    const dayCode = `JO-${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,"0")}-${now.getDate().toString().padStart(2,"0")}-${now.getHours().toString().padStart(2,"0")}${now.getMinutes().toString().padStart(2,"0")}`;
    
    const { data: newDay } = await (supabase.from("operational_days" as any) as any)
      .insert({ day_code: dayCode, opened_by: session?.user?.id, status: "open" })
      .select()
      .single();

    if (newDay) {
      const shiftCode = `MM-${now.getFullYear().toString().slice(2)}${(now.getMonth()+1).toString().padStart(2,"0")}${now.getDate().toString().padStart(2,"0")}-${Math.floor(Math.random()*9000+1000)}`;
      await (supabase.from("cash_sessions" as any) as any).insert({
        session_code: shiftCode,
        opened_by: session?.user?.id,
        status: "open",
        operational_day_id: newDay.id,
        cashier_name: shift,
      });
    }

    setShowShiftPicker(false);
    setProcessing(false);
    await fetchState();
  };

  // === END CURRENT SHIFT (Passation / X de caisse) — only allowed once ===
  const endShift = async () => {
    if (!currentShift || !currentDay || !canDoPassation) return;
    setProcessing(true);

    // Get orders for THIS shift only (between shift open and now)
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

    generateShiftReport(currentShift, ordersList, shiftSales);

    // Automatically create the next shift (Soir if current was Matin, vice versa)
    const { data: { session } } = await supabase.auth.getSession();
    const now = new Date();
    const shiftCode2 = `MM-${now.getFullYear().toString().slice(2)}${(now.getMonth()+1).toString().padStart(2,"0")}${now.getDate().toString().padStart(2,"0")}-${Math.floor(Math.random()*9000+1000)}`;
    await (supabase.from("cash_sessions" as any) as any).insert({
      session_code: shiftCode2,
      opened_by: session?.user?.id,
      status: "open",
      operational_day_id: currentDay.id,
      cashier_name: nextShiftName,
    });

    setProcessing(false);
    await fetchState();
  };

  // === CLOSE THE FULL DAY (Z de caisse) ===
  const closeDay = async () => {
    if (!currentDay) return;
    setProcessing(true);

    // Close current shift if open
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

    // Get ALL orders for the entire day
    const { data: dayOrders } = await (supabase.from("orders" as any) as any)
      .select("*")
      .gte("created_at", currentDay.opened_at)
      .order("created_at", { ascending: true });

    const allOrders = (dayOrders || []) as any[];
    const dayTotal = allOrders.reduce((s: number, o: any) => s + (o.total || 0), 0);

    const { data: allShifts } = await (supabase.from("cash_sessions" as any) as any)
      .select("*")
      .eq("operational_day_id", currentDay.id)
      .order("opened_at", { ascending: true });

    await (supabase.from("operational_days" as any) as any)
      .update({
        closed_at: new Date().toISOString(),
        status: "closed",
        total_sales: dayTotal,
        total_orders: allOrders.length,
      })
      .eq("id", currentDay.id);

    generateDayPDF(currentDay, (allShifts || []) as Session[], allOrders, dayTotal);

    setCurrentDay(null);
    setCurrentShift(null);
    setAllDayShifts([]);
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
          <button onClick={() => regenerateDayPDF(selectedDay)} className="ml-auto p-2 text-primary hover:text-primary/80" title="Voir le Z de caisse">
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

  // === SHIFT PICKER MODAL (only for opening a new day) ===
  if (showShiftPicker) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-card border-b border-border p-3 flex items-center gap-3">
          <button onClick={() => setShowShiftPicker(false)} className="p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-foreground">Ouverture de journée</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Quel service ?</h2>
              <p className="text-sm text-muted-foreground mt-1">Choisissez le créneau du caissier</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => confirmOpenDay("Matin")}
                disabled={processing}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-white py-6 rounded-xl font-bold text-lg flex flex-col items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Sun className="h-8 w-8" />
                Matin
              </button>
              <button
                onClick={() => confirmOpenDay("Soir")}
                disabled={processing}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-xl font-bold text-lg flex flex-col items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Moon className="h-8 w-8" />
                Soir
              </button>
            </div>
            {processing && <p className="text-center text-sm text-muted-foreground">En cours...</p>}
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
          /* === Caisse ouverte avec un service actif === */
          <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Unlock className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Caisse ouverte</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Caissier <span className="font-medium text-foreground">{currentShift.cashier_name}</span> en service
              </p>
              <p className="text-xs text-muted-foreground mt-1">Journée : {currentDay.day_code}</p>
              <p className="text-xs text-muted-foreground">
                Service depuis {new Date(currentShift.opened_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            {/* Passation button — only if first shift and no passation yet */}
            {canDoPassation && (
              <>
                <button
                  onClick={endShift}
                  disabled={processing}
                  className="w-full bg-amber-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserCheck className="h-4 w-4" />
                  {processing ? "En cours..." : `Passation → ${nextShiftName}`}
                </button>
                <p className="text-xs text-muted-foreground">
                  Imprime le X de caisse et ouvre automatiquement le service {nextShiftName}
                </p>
              </>
            )}

            <button
              onClick={closeDay}
              disabled={processing}
              className="w-full bg-destructive text-destructive-foreground py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              {processing ? "Clôture en cours..." : "Clôture de fin de journée"}
            </button>
            <p className="text-xs text-muted-foreground">Génère le Z de caisse avec TOUTES les ventes depuis l'ouverture</p>

            <button
              onClick={onBack}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold"
            >
              Retour au dashboard
            </button>
          </div>
        ) : (
          /* === Journée fermée === */
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
