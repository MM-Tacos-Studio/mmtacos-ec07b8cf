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
  ticketCode?: string;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  onNewOrder: () => void;
  newOrderLabel?: string;
}

const ReceiptPreview = ({ items, orderNumber, ticketCode, total, paymentMethod, amountPaid, onNewOrder, newOrderLabel }: ReceiptPreviewProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

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
          body { font-family: 'Courier New', monospace; font-size: 13px; width: 72.1mm; color: #000; line-height: 1.5; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; padding: 3px 0; }
          .logo { width: 70px; height: 70px; margin: 0 auto 8px; display: block; }
          .header-info { font-size: 12px; line-height: 1.6; margin-bottom: 4px; }
          .ticket-num { font-size: 28px; font-weight: bold; text-align: center; margin: 10px 0; }
          .item-block { padding: 6px 0; }
          .item-main { display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; }
          .item-detail { font-size: 11px; color: #444; padding-left: 20px; margin-top: 1px; }
          .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
          .total-row { font-weight: bold; font-size: 15px; }
          .footer { font-size: 11px; text-align: center; margin-top: 12px; line-height: 1.5; }
          .generator { font-size: 10px; text-align: center; margin-top: 14px; color: #666; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="center">
          <img src="${logo}" class="logo" />
          <div class="header-info">
            Ticket MM-${orderNumber}<br/>
            ${ticketCode ? `Code: ${ticketCode}<br/>` : ""}
            ${dateStr} ${timeStr}<br/>
            mmtacos2022@gmail.com<br/>
            +223 84437961<br/>
            Servi par : MM TACOS CAISSE
          </div>
          <div class="ticket-num">${orderNumber}</div>
        </div>
        <div class="line"></div>
        ${items.map(item => `
          <div class="item-block">
            <div class="item-main">
              <span>${item.qty} &nbsp; ${item.name}</span>
              <span>${(item.price * item.qty).toLocaleString()} CFA</span>
            </div>
            ${item.qty > 1 ? `<div class="item-detail">${item.price.toLocaleString()} CFA / Unité(s)</div>` : ""}
          </div>
        `).join("")}
        <div class="line"></div>
        <div class="summary-row"><span>Sous-total</span><span>${total.toLocaleString()} CFA</span></div>
        <div class="summary-row"><span>Taxe 0 %</span><span>0 CFA</span></div>
        <div class="summary-row total-row"><span>Total</span><span>${total.toLocaleString()} CFA</span></div>
        <div class="summary-row"><span>Espèces</span><span>${amountPaid.toLocaleString()} CFA</span></div>
        <div class="line"></div>
        <div class="footer">
          <strong>MM TACOS</strong><br/>
          Magnambougou près du marché, Bamako<br/>
          mmtacosm2022@gmail.com
        </div>
        <div class="generator">par Jamaney Production</div>
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
      <div ref={receiptRef} className="bg-white text-black w-[272px] p-4 shadow-lg rounded font-mono text-xs">
        <div className="text-center">
          <img src={logo} alt="MM Tacos" className="w-16 h-16 mx-auto mb-2 grayscale" />
          <p className="text-[10px]">
            Ticket MM-{orderNumber}<br />
            {ticketCode && <>Code: {ticketCode}<br /></>}
            {dateStr} {timeStr}<br />
            mmtacos2022@gmail.com<br />
            +223 84437961<br />
            Servi par : MM TACOS CAISSE
          </p>
          <p className="text-2xl font-bold my-2">{orderNumber}</p>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        {items.map((item) => (
          <div key={item.id} className="py-1">
            <div className="flex justify-between font-bold text-xs">
              <span>{item.qty} &nbsp; {item.name}</span>
              <span className="whitespace-nowrap">{(item.price * item.qty).toLocaleString()} CFA</span>
            </div>
            {item.qty > 1 && (
              <p className="text-[10px] text-gray-500 pl-5">{item.price.toLocaleString()} CFA / Unité(s)</p>
            )}
          </div>
        ))}

        <div className="border-t border-dashed border-gray-400 my-2" />

        <div className="flex justify-between text-xs py-0.5"><span>Sous-total</span><span>{total.toLocaleString()} CFA</span></div>
        <div className="flex justify-between text-xs py-0.5"><span>Taxe 0 %</span><span>0 CFA</span></div>
        <div className="flex justify-between font-bold text-sm py-1"><span>Total</span><span>{total.toLocaleString()} CFA</span></div>
        <div className="flex justify-between text-xs py-0.5"><span>Espèces</span><span>{amountPaid.toLocaleString()} CFA</span></div>

        <div className="border-t border-dashed border-gray-400 my-2" />
        <div className="text-center text-[10px]">
          <strong>MM TACOS</strong><br />
          Magnambougou près du marché, Bamako<br />
          mmtacosm2022@gmail.com
        </div>
        <p className="text-center text-[9px] text-gray-400 mt-3 font-bold">par Jamaney Production</p>
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
          Imprimer
        </button>
        <button
          onClick={onNewOrder}
          className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90"
        >
          {newOrderLabel || "Nouvelle commande"}
        </button>
      </div>
    </div>
  );
};

export default ReceiptPreview;
