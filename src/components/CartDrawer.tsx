import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingCart, Phone, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const [deliveryType, setDeliveryType] = useState<"livraison" | "emporter" | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+223");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPhoneValid = () => {
    const cleaned = phoneNumber.replace(/\s/g, "");
    return cleaned.length >= 11;
  };

  const buildWhatsAppMessage = () => {
    const lines: string[] = [];
    lines.push("🛒 *Commande Multiple MM'TACOS*");
    lines.push("");

    items.forEach((item, i) => {
      lines.push(`${i + 1}. ${item.quantity}x ${item.name}${item.size ? ` (${item.size})` : ""}`);
      if (item.meatChoice) lines.push(`   Viande : ${item.meatChoice}`);
      if (item.meatDistribution) {
        lines.push(`   Viande: ${item.meatDistribution.viande} | Poulet: ${item.meatDistribution.poulet}`);
      }
      if (item.companyName) lines.push(`   Entreprise : ${item.companyName}`);
      if (item.supplements.length > 0) {
        const suppStr = item.supplements.map((s) => `${s.qty}x ${s.name}`).join(", ");
        lines.push(`   Suppléments : ${suppStr}`);
      }
      const itemTotal =
        item.type === "family" || item.type === "enterprise"
          ? item.unitPrice * item.quantity
          : (item.unitPrice + item.supplements.reduce((s, sup) => s + sup.price * sup.qty, 0)) * item.quantity;
      lines.push(`   → ${itemTotal.toLocaleString()} FCFA`);
    });

    lines.push("");
    lines.push(`📦 ${deliveryType === "livraison" ? `Livraison : ${deliveryAddress}` : "Récupération sur place"}`);
    lines.push(`📞 ${phoneNumber}`);
    lines.push("");
    lines.push(`💰 *Total : ${totalPrice.toLocaleString()} FCFA*`);
    lines.push("");
    lines.push("Merci !");
    lines.push("#Commandeviasitemmtacos");
    return lines.join("\n");
  };

  const handleOrderAll = async () => {
    if (!deliveryType || items.length === 0) return;
    if (deliveryType === "livraison" && !deliveryAddress.trim()) return;
    if (!isPhoneValid()) return;

    setIsSubmitting(true);

    try {
      // Save each item as a separate client_order
      for (const item of items) {
        const orderDetails: any = {
          tacoName: item.name,
          size: item.size || null,
          meatChoice: item.meatChoice || null,
          quantity: item.quantity,
          supplements: item.supplements,
          unitPrice: item.unitPrice,
          menuQuantity: item.menuQuantity,
          meatDistribution: item.meatDistribution,
          companyName: item.companyName,
          bonus: item.bonus,
          fromCart: true,
        };

        const itemTotal =
          item.type === "family" || item.type === "enterprise"
            ? item.unitPrice * item.quantity
            : (item.unitPrice + item.supplements.reduce((s, sup) => s + sup.price * sup.qty, 0)) * item.quantity;

        await supabase.from("client_orders" as any).insert({
          order_type: item.type,
          order_details: orderDetails,
          phone: phoneNumber.replace(/\s/g, ""),
          delivery_type: deliveryType,
          delivery_address: deliveryType === "livraison" ? deliveryAddress.trim() : null,
          total: itemTotal,
        } as any);
      }

      const whatsappUrl = `https://wa.me/22384437961?text=${encodeURIComponent(buildWhatsAppMessage())}`;
      const win = window.open(whatsappUrl, "_blank");
      if (!win) window.location.href = whatsappUrl;

      toast.success("Commande envoyée ! Redirection vers WhatsApp...");
      clearCart();
      onClose();
    } catch (e) {
      console.error("Error saving cart order:", e);
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItemTotal = (item: typeof items[0]) => {
    if (item.type === "family" || item.type === "enterprise") {
      return item.unitPrice * item.quantity;
    }
    const suppTotal = item.supplements.reduce((s, sup) => s + sup.price * sup.qty, 0);
    return (item.unitPrice + suppTotal) * item.quantity;
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Mon Panier ({items.length} article{items.length > 1 ? "s" : ""})
          </DrawerTitle>
          <DrawerDescription>
            Gérez vos articles et commandez tout en une fois
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto max-h-[60vh] space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Votre panier est vide</p>
              <p className="text-sm mt-1">Ajoutez des tacos depuis le menu</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-foreground truncate">{item.name}</h4>
                        {item.size && <span className="text-xs text-muted-foreground">Taille {item.size}</span>}
                        {item.meatChoice && <span className="text-xs text-muted-foreground ml-1">• {item.meatChoice}</span>}
                        {item.meatDistribution && (
                          <p className="text-xs text-muted-foreground">V:{item.meatDistribution.viande} P:{item.meatDistribution.poulet}</p>
                        )}
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-destructive p-1 hover:bg-destructive/10 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {item.supplements.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        + {item.supplements.map((s) => s.name).join(", ")}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="bg-card p-1 rounded-full hover:bg-accent"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="bg-primary text-primary-foreground p-1 rounded-full"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-bold text-primary text-sm">{getItemTotal(item).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Delivery & Phone */}
              <div className="p-3 bg-muted rounded-lg space-y-3">
                <span className="font-bold text-primary text-sm block">Livraison ou récupération ? *</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeliveryType("livraison")}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                      deliveryType === "livraison" ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-accent"
                    }`}
                  >
                    Livraison
                  </button>
                  <button
                    onClick={() => setDeliveryType("emporter")}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                      deliveryType === "emporter" ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-accent"
                    }`}
                  >
                    Récupérer
                  </button>
                </div>
                {deliveryType === "livraison" && (
                  <input
                    type="text"
                    placeholder="Votre adresse de livraison..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm"
                  />
                )}
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <span className="font-bold text-primary text-sm mb-2 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Numéro de téléphone *
                </span>
                <input
                  type="tel"
                  placeholder="+223 XX XX XX XX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm"
                />
                {!isPhoneValid() && phoneNumber.length > 4 && (
                  <p className="text-destructive text-xs mt-1">* Minimum 8 chiffres après +223</p>
                )}
              </div>

              {/* Total & Order */}
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">{totalPrice.toLocaleString()} FCFA</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">💵 Paiement à la livraison</p>
                <button
                  onClick={handleOrderAll}
                  disabled={
                    items.length === 0 ||
                    !deliveryType ||
                    (deliveryType === "livraison" && !deliveryAddress.trim()) ||
                    !isPhoneValid() ||
                    isSubmitting
                  }
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold flex items-center justify-center gap-2 
                    hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isSubmitting ? "Envoi en cours..." : "Commander tout via WhatsApp"}
                </button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;
