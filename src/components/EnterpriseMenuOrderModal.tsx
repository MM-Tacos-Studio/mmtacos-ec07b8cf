import { useState, useEffect } from "react";
import { ShoppingCart, Building2, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EnterpriseMenu {
  id: string;
  quantity: number;
  price: number;
  pricePerMenu: number;
}

interface MeatDistribution {
  viande: number;
  poulet: number;
}

interface EnterpriseMenuOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: EnterpriseMenu | null;
  initialDeliveryMode?: "livraison" | "emporter" | null;
  initialDeliveryAddress?: string;
}

const EnterpriseMenuOrderModal = ({ isOpen, onClose, menu, initialDeliveryMode, initialDeliveryAddress }: EnterpriseMenuOrderModalProps) => {
  const [meatDistribution, setMeatDistribution] = useState<MeatDistribution>({ viande: 0, poulet: 0 });
  const [deliveryType, setDeliveryType] = useState<"livraison" | "emporter" | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+223");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (menu && isOpen) {
      const half = Math.floor(menu.quantity / 2);
      setMeatDistribution({ viande: menu.quantity - half, poulet: half });
      setDeliveryType(initialDeliveryMode || null);
      setDeliveryAddress(initialDeliveryAddress || "");
      setCompanyName("");
      setPhoneNumber("+223");
      setIsSubmitting(false);
    }
  }, [menu, isOpen, initialDeliveryMode, initialDeliveryAddress]);

  if (!menu) return null;

  const handleMeatChange = (type: "viande" | "poulet", delta: number) => {
    setMeatDistribution((prev) => {
      const newValue = Math.max(0, Math.min(menu.quantity, prev[type] + delta));
      const remaining = menu.quantity - newValue;
      return type === "viande" ? { viande: newValue, poulet: remaining } : { viande: remaining, poulet: newValue };
    });
  };

  const isPhoneValid = () => {
    const cleaned = phoneNumber.replace(/\s/g, "");
    return cleaned.length >= 11;
  };

  const handleOrder = async () => {
    if (!deliveryType) return;
    if (deliveryType === "livraison" && !deliveryAddress.trim()) return;
    if (!isPhoneValid()) return;

    setIsSubmitting(true);

    const orderDetails = {
      menuQuantity: menu.quantity,
      meatDistribution,
      companyName: companyName.trim() || null,
      pricePerMenu: menu.pricePerMenu,
    };

    // Build WhatsApp message
    const buildWhatsAppMessage = () => {
      const lines: string[] = [];
      lines.push(`🏢 *Menu Entreprise - ${menu.quantity} Menus*`);
      if (companyName.trim()) lines.push(`Entreprise : ${companyName.trim()}`);
      lines.push(`Viande : ${meatDistribution.viande} | Poulet : ${meatDistribution.poulet}`);
      lines.push(`${menu.pricePerMenu.toLocaleString()} FCFA/menu`);
      lines.push("");
      lines.push(`📦 ${deliveryType === "livraison" ? `Livraison : ${deliveryAddress}` : "Récupération sur place"}`);
      lines.push(`📞 ${phoneNumber}`);
      lines.push("");
      lines.push(`💰 *Total : ${menu.price.toLocaleString()} FCFA*`);
      lines.push("");
      lines.push("Merci !");
      lines.push("#Commandeviasitemmtacos");
      return lines.join("\n");
    };

    try {
      const { error } = await supabase.from("client_orders" as any).insert({
        order_type: "enterprise",
        order_details: orderDetails,
        phone: phoneNumber.replace(/\s/g, ""),
        delivery_type: deliveryType,
        delivery_address: deliveryType === "livraison" ? deliveryAddress.trim() : null,
        total: menu.price,
      } as any);

      if (error) throw error;

      const whatsappUrl = `https://wa.me/22378952678?text=${encodeURIComponent(buildWhatsAppMessage())}`;
      const win = window.open(whatsappUrl, "_blank");
      if (!win) window.location.href = whatsappUrl;

      toast.success("Commande envoyée ! Redirection vers WhatsApp...");
      onClose();
    } catch (e) {
      console.error("Error saving order:", e);
      toast.error("Erreur lors de l'envoi de la commande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Menu Entreprise - {menu.quantity} Menus
          </DialogTitle>
        </DialogHeader>

        {/* Menu Info */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg">{menu.quantity} Menus Complets</span>
            <span className="text-2xl font-extrabold text-primary">{menu.price.toLocaleString()} FCFA</span>
          </div>
          <p className="text-sm text-green-600 font-medium">
            Soit {menu.pricePerMenu.toLocaleString()} FCFA par menu
          </p>
        </div>

        {/* Company Name */}
        <div className="p-4 bg-muted rounded-lg">
          <span className="font-bold text-primary mb-3 block">Nom de l'entreprise (optionnel)</span>
          <input
            type="text"
            placeholder="Ex: Société ABC..."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Meat Distribution */}
        <div className="p-4 bg-muted rounded-lg">
          <span className="font-bold text-primary mb-3 block">
            Répartition viande/poulet ({menu.quantity} tacos)
          </span>
          <div className="space-y-4">
            {(["viande", "poulet"] as const).map((type) => (
              <div key={type} className="flex items-center justify-between">
                <span className="font-medium">Tacos {type === "viande" ? "Viande" : "Poulet"}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleMeatChange(type, -1)}
                    className="bg-card w-8 h-8 rounded-full hover:bg-accent transition-colors flex items-center justify-center font-bold"
                  >-</button>
                  <span className="font-bold text-lg w-8 text-center">{meatDistribution[type]}</span>
                  <button
                    onClick={() => handleMeatChange(type, 1)}
                    className="bg-primary text-primary-foreground w-8 h-8 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center font-bold"
                  >+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Type */}
        <div className="p-4 bg-muted rounded-lg">
          <span className="font-bold text-primary mb-3 block">Livraison ou récupération ? *</span>
          <div className="flex gap-3">
            <button
              onClick={() => setDeliveryType("livraison")}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                deliveryType === "livraison" ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-accent"
              }`}
            >Livraison</button>
            <button
              onClick={() => setDeliveryType("emporter")}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all text-sm ${
                deliveryType === "emporter" ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-accent"
              }`}
            >Je viendrais récupérer</button>
          </div>
          {deliveryType === "livraison" && (
            <input
              type="text"
              placeholder="Adresse de livraison..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full mt-3 p-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground"
            />
          )}
          {!deliveryType && <p className="text-destructive text-sm mt-2">* Veuillez choisir</p>}
          {deliveryType === "livraison" && !deliveryAddress.trim() && (
            <p className="text-destructive text-sm mt-2">* Veuillez entrer l'adresse</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="p-4 bg-muted rounded-lg">
          <span className="font-bold text-primary mb-3 block flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Numéro de téléphone *
          </span>
          <input
            type="tel"
            placeholder="+223 XX XX XX XX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground"
          />
          {!isPhoneValid() && phoneNumber.length > 4 && (
            <p className="text-destructive text-sm mt-2">* Numéro invalide (minimum 8 chiffres après +223)</p>
          )}
        </div>

        {/* Order Button */}
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold">Total</span>
            <span className="text-xl font-bold text-primary">{menu.price.toLocaleString()} FCFA</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">💵 Paiement à la livraison</p>
          <button
            onClick={handleOrder}
            disabled={!deliveryType || (deliveryType === "livraison" && !deliveryAddress.trim()) || !isPhoneValid() || isSubmitting}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold flex items-center justify-center gap-2 
              hover:opacity-90 transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-5 w-5" />
            {isSubmitting ? "Envoi en cours..." : "Commander via WhatsApp"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnterpriseMenuOrderModal;
