import { useState, useEffect } from "react";
import { MessageCircle, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
}

const EnterpriseMenuOrderModal = ({ isOpen, onClose, menu, initialDeliveryMode }: EnterpriseMenuOrderModalProps) => {
  const [meatDistribution, setMeatDistribution] = useState<MeatDistribution>({ viande: 0, poulet: 0 });
  const [deliveryType, setDeliveryType] = useState<"livraison" | "emporter" | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (menu && isOpen) {
      const half = Math.floor(menu.quantity / 2);
      setMeatDistribution({
        viande: menu.quantity - half,
        poulet: half,
      });
      setDeliveryType(initialDeliveryMode || null);
      setDeliveryAddress("");
      setCompanyName("");
    }
  }, [menu, isOpen, initialDeliveryMode]);

  if (!menu) return null;

  const handleMeatChange = (type: "viande" | "poulet", delta: number) => {
    setMeatDistribution((prev) => {
      const newValue = Math.max(0, Math.min(menu.quantity, prev[type] + delta));
      const remaining = menu.quantity - newValue;
      if (type === "viande") {
        return { viande: newValue, poulet: remaining };
      }
      return { viande: remaining, poulet: newValue };
    });
  };

  const handleOrder = () => {
    if (!deliveryType) return;
    if (deliveryType === "livraison" && !deliveryAddress.trim()) return;

    const deliveryText = deliveryType === "livraison"
      ? `Livraison à ${deliveryAddress.trim()}`
      : "Je viendrais récupérer";

    const companyText = companyName.trim() ? `\n\n🏢 Entreprise : ${companyName.trim()}` : "";

    const message = `Bonjour je voudrais commander :\n\n🏢 MENU ENTREPRISE ${menu.quantity} MENUS COMPLETS${companyText}\n\nRépartition :\n• ${meatDistribution.viande}x Tacos Viande\n• ${meatDistribution.poulet}x Tacos Poulet\n\nChaque menu comprend :\n• Tacos (viande ou poulet) + sauce fromagère\n• Frites à l'intérieur + accompagnement\n• Boisson\n\n${deliveryText}\n\nTotal : ${menu.price.toLocaleString()} FCFA\n(${menu.pricePerMenu.toLocaleString()} FCFA/menu)\n\nMerci !`;

    const whatsappUrl = `https://wa.me/22373360131?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    onClose();
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
            <span className="text-2xl font-extrabold text-primary">
              {menu.price.toLocaleString()} FCFA
            </span>
          </div>
          <p className="text-sm text-green-600 font-medium">
            Soit {menu.pricePerMenu.toLocaleString()} FCFA par menu
          </p>
        </div>

        {/* Company Name (Optional) */}
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
            {/* Viande */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Tacos Viande</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleMeatChange("viande", -1)}
                  className="bg-card w-8 h-8 rounded-full hover:bg-accent transition-colors flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="font-bold text-lg w-8 text-center">{meatDistribution.viande}</span>
                <button
                  onClick={() => handleMeatChange("viande", 1)}
                  className="bg-primary text-primary-foreground w-8 h-8 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Poulet */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Tacos Poulet</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleMeatChange("poulet", -1)}
                  className="bg-card w-8 h-8 rounded-full hover:bg-accent transition-colors flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="font-bold text-lg w-8 text-center">{meatDistribution.poulet}</span>
                <button
                  onClick={() => handleMeatChange("poulet", 1)}
                  className="bg-primary text-primary-foreground w-8 h-8 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Type */}
        <div className="p-4 bg-muted rounded-lg">
          <span className="font-bold text-primary mb-3 block">Livraison ou récupération ? *</span>
          <div className="flex gap-3">
            <button
              onClick={() => setDeliveryType("livraison")}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                deliveryType === "livraison"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-accent"
              }`}
            >
              Livraison
            </button>
            <button
              onClick={() => setDeliveryType("emporter")}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all text-sm ${
                deliveryType === "emporter"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-accent"
              }`}
            >
              Je viendrais récupérer
            </button>
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
          {!deliveryType && (
            <p className="text-destructive text-sm mt-2">* Veuillez choisir</p>
          )}
          {deliveryType === "livraison" && !deliveryAddress.trim() && (
            <p className="text-destructive text-sm mt-2">* Veuillez entrer l'adresse</p>
          )}
        </div>

        {/* Order Button */}
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold">Total</span>
            <span className="text-xl font-bold text-primary">
              {menu.price.toLocaleString()} FCFA
            </span>
          </div>
          
          {/* Payment Info */}
          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
            💵 Paiement à la livraison
          </p>
          
          <button
            onClick={handleOrder}
            disabled={!deliveryType || (deliveryType === "livraison" && !deliveryAddress.trim())}
            className="w-full bg-[#25D366] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 
              shadow-[0_4px_0_0] shadow-[#1da851]
              hover:-translate-y-0.5 hover:shadow-[0_6px_0_0] hover:shadow-[#1da851]
              active:translate-y-0 active:shadow-none
              transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
          >
            <MessageCircle className="h-5 w-5" />
            Commander via WhatsApp
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnterpriseMenuOrderModal;
