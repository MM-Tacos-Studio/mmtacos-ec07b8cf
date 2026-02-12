import { useRef } from "react";
import { Printer } from "lucide-react";
import logo from "@/assets/mm-tacos-logo-transparent.png";

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface ReceiptPreviewProps {
  items: OrderItem[];
  orderNumber: string;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  onNewOrder: () => void;
}

const ReceiptPreview = ({ items, orderNumber, total, paymentMethod, amountPaid, onNewOrder }: ReceiptPreviewProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const change = Math.max(0, amountPaid - total);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=302,height=600");
    if (!printWindow) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket ${orderNumber}</title>
        <style>
          @page { size: 80mm auto; margin: 2mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; width: 76mm; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 4px 0; }
          .row { display: flex; justify-content: space-between; padding: 1px 0; }
          .logo { width: 60px; height: 60px; margin: 0 auto 4px; display: block; }
          .ticket-num { font-size: 24px; font-weight: bold; text-align: center; margin: 6px 0; }
          .item-row { display: flex; gap: 6px; padding: 2px 0; }
          .item-qty { width: 20px; text-align: right; flex-shrink: 0; }
          .item-name { flex: 1; }
          .item-price { text-align: right; white-space: nowrap; }
          .total-row { font-weight: bold; font-size: 14px; }
          .footer { font-size: 10px; text-align: center; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="center">
          <img src="${logo}" class="logo" />
          <div style="font-size:10px;">
            Ticket MM-${orderNumber}<br/>
            ${dateStr} ${timeStr}<br/>
            mmtacos2022@gmail.com<br/>
            +223 84437961<br/>
            Servi par : MM TACOS CAISSE
          </div>
          <div class="ticket-num">${orderNumber}</div>
        </div>
        <div class="line"></div>
        ${items.map(item => `
          <div class="item-row">
            <span class="item-qty">${item.qty}</span>
            <span class="item-name">${item.name}</span>
            <span class="item-price">${(item.price * item.qty).toLocaleString()} CFA</span>
          </div>
        `).join("")}
        <div class="line"></div>
        <div class="row"><span>Sous-total</span><span>${total.toLocaleString()} CFA</span></div>
        <div class="row"><span>Taxe 0 %</span><span>0 CFA</span></div>
        <div class="row total-row"><span>Total</span><span>${total.toLocaleString()} CFA</span></div>
        <div class="row"><span>${paymentMethod === "especes" ? "Espèces" : paymentMethod}</span><span>${amountPaid.toLocaleString()} CFA</span></div>
        ${change > 0 ? `<div class="row"><span>Rendu</span><span>${change.toLocaleString()} CFA</span></div>` : ""}
        <div class="line"></div>
        <div class="footer">
          MM TACOS<br/>
          Magnambougou près du marché, Bamako<br/>
          mmtacosm2022@gmail.com
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Receipt preview */}
      <div ref={receiptRef} className="bg-white text-black w-[302px] p-4 shadow-lg rounded font-mono text-xs">
        <div className="text-center">
          <img src={logo} alt="MM Tacos" className="w-16 h-16 mx-auto mb-2 grayscale" />
          <p className="text-[10px]">
            Ticket MM-{orderNumber}<br />
            {dateStr} {timeStr}<br />
            mmtacos2022@gmail.com<br />
            +223 84437961<br />
            Servi par : MM TACOS CAISSE
          </p>
          <p className="text-2xl font-bold my-2">{orderNumber}</p>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        {items.map((item) => (
          <div key={item.id} className="flex gap-1 py-0.5">
            <span className="w-5 text-right shrink-0">{item.qty}</span>
            <span className="flex-1">{item.name}</span>
            <span className="text-right whitespace-nowrap">{(item.price * item.qty).toLocaleString()} CFA</span>
          </div>
        ))}

        <div className="border-t border-dashed border-gray-400 my-2" />

        <div className="flex justify-between"><span>Sous-total</span><span>{total.toLocaleString()} CFA</span></div>
        <div className="flex justify-between"><span>Taxe 0 %</span><span>0 CFA</span></div>
        <div className="flex justify-between font-bold text-sm"><span>Total</span><span>{total.toLocaleString()} CFA</span></div>
        <div className="flex justify-between">
          <span>{paymentMethod === "especes" ? "Espèces" : paymentMethod}</span>
          <span>{amountPaid.toLocaleString()} CFA</span>
        </div>
        {change > 0 && (
          <div className="flex justify-between"><span>Rendu</span><span>{change.toLocaleString()} CFA</span></div>
        )}

        <div className="border-t border-dashed border-gray-400 my-2" />
        <div className="text-center text-[10px]">
          MM TACOS<br />
          Magnambougou près du marché, Bamako<br />
          mmtacosm2022@gmail.com
        </div>
      </div>

      {/* Payment success */}
      <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center w-full max-w-sm">
        <div className="text-2xl mb-1">✅</div>
        <p className="font-bold">Paiement réussi</p>
        <p className="text-xl font-bold">{total.toLocaleString()} CFA</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-3 rounded-lg font-medium hover:bg-muted/80"
        >
          <Printer className="h-4 w-4" />
          Imprimer le reçu complet
        </button>
        <button
          onClick={onNewOrder}
          className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90"
        >
          Nouvelle commande
        </button>
      </div>
    </div>
  );
};

export default ReceiptPreview;
