import { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Taco, TacoSize } from "./TacosSection";

// Import supplement images
import supplementFromage from "@/assets/supplement-fromage.png";
import supplementFrites from "@/assets/supplement-frites.png";
import supplementAnanas from "@/assets/supplement-ananas.png";
import supplementOlives from "@/assets/supplement-olives.png";
import supplementGratine from "@/assets/supplement-gratine.png";
import supplementJambon from "@/assets/supplement-jambon.png";
import supplementOeufs from "@/assets/supplement-oeufs.png";
import supplementHotdog from "@/assets/supplement-hotdog.png";

interface Supplement {
  id: string;
  name: string;
  price: number;
  category: "boisson" | "supplement";
  image?: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  taco: Taco | null;
  initialDeliveryMode?: "livraison" | "emporter" | null;
  initialDeliveryAddress?: string;
}

const supplements: Supplement[] = [
  { id: "fromage-fondant", name: "Fromage fondant", price: 500, category: "supplement", image: supplementFromage },
  { id: "frites", name: "Frites croustillantes", price: 500, category: "supplement", image: supplementFrites },
  { id: "ananas", name: "Tranche d'ananas", price: 500, category: "supplement", image: supplementAnanas },
  { id: "olives", name: "Olives", price: 500, category: "supplement", image: supplementOlives },
  { id: "gratine", name: "Gratiné avec fromage", price: 1000, category: "supplement", image: supplementGratine },
  { id: "jambon", name: "Jambon", price: 500, category: "supplement", image: supplementJambon },
  { id: "oeufs", name: "Œufs", price: 500, category: "supplement", image: supplementOeufs },
  { id: "hotdog-saucisse", name: "Hotdog saucisse", price: 1000, category: "supplement", image: supplementHotdog },
  { id: "boisson", name: "Boisson", price: 500, category: "boisson" },
  { id: "menthe-lait", name: "Menthe au lait", price: 1000, category: "boisson" },
];

const OrderModal = ({ isOpen, onClose, taco, initialDeliveryMode, initialDeliveryAddress }: OrderModalProps) => {
  const [selectedSupplements, setSelectedSupplements] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<TacoSize | null>(null);
  const [meatChoice, setMeatChoice] = useState<"viande" | "poulet" | null>(null);
  const [deliveryType, setDeliveryType] = useState<"livraison" | "emporter" | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+223");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taco && isOpen) {
      setSelectedSupplements({});
      setQuantity(1);
      setSelectedSize(taco.sizes?.[0] || null);
      setMeatChoice(null);
      setDeliveryType(initialDeliveryMode || null);
      setDeliveryAddress(initialDeliveryAddress || "");
      setPhoneNumber("+223");
      setIsSubmitting(false);
    }
  }, [taco, isOpen, initialDeliveryMode, initialDeliveryAddress]);

  if (!taco) return null;

  const handleSupplementChange = (id: string, delta: number) => {
    setSelectedSupplements((prev) => {
      const current = prev[id] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newValue };
    });
  };

  const calculateTotal = () => {
    const basePrice = selectedSize?.price || taco.price;
    const supplementsTotal = Object.entries(selectedSupplements).reduce(
      (sum, [id, qty]) => {
        const supplement = supplements.find((s) => s.id === id);
        return sum + (supplement?.price || 0) * qty;
      },
      0
    );
    return (basePrice + supplementsTotal) * quantity;
  };

  const isPhoneValid = () => {
    const cleaned = phoneNumber.replace(/\s/g, "");
    return cleaned.length >= 11; // +223 + 8 digits
  };

  const handleOrder = async () => {
    if (taco.requiresMeatChoice && !meatChoice) return;
    if (!deliveryType) return;
    if (deliveryType === "livraison" && !deliveryAddress.trim()) return;
    if (!isPhoneValid()) return;

    setIsSubmitting(true);

    const supplementsList = Object.entries(selectedSupplements)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const supplement = supplements.find((s) => s.id === id);
        return { name: supplement?.name, qty, price: supplement?.price };
      });

    const orderDetails = {
      tacoName: taco.name,
      size: selectedSize?.name || null,
      meatChoice: meatChoice || null,
      quantity,
      supplements: supplementsList,
      unitPrice: selectedSize?.price || taco.price,
    };

    // Build WhatsApp message
    const buildWhatsAppMessage = () => {
      const lines: string[] = [];
      lines.push(`🌮 *Commande Tacos*`);
      lines.push(`${quantity}x ${taco.name}${selectedSize ? ` (${selectedSize.name})` : ""}`);
      if (meatChoice) lines.push(`Viande : ${meatChoice}`);
      const suppList = Object.entries(selectedSupplements)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => {
          const s = supplements.find((s) => s.id === id);
          return `${qty}x ${s?.name}`;
        });
      if (suppList.length > 0) lines.push(`Suppléments : ${suppList.join(", ")}`);
      lines.push("");
      lines.push(`📦 ${deliveryType === "livraison" ? `Livraison : ${deliveryAddress}` : "Récupération sur place"}`);
      lines.push(`📞 ${phoneNumber}`);
      lines.push("");
      lines.push(`💰 *Total : ${calculateTotal().toLocaleString()} FCFA*`);
      lines.push("");
      lines.push("Merci !");
      lines.push("#Commandeviasitemmtacos");
      return lines.join("\n");
    };

    try {
      const { error } = await supabase.from("client_orders" as any).insert({
        order_type: "tacos",
        order_details: orderDetails,
        phone: phoneNumber.replace(/\s/g, ""),
        delivery_type: deliveryType,
        delivery_address: deliveryType === "livraison" ? deliveryAddress.trim() : null,
        total: calculateTotal(),
      } as any);

      if (error) throw error;

      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/22373360131?text=${encodeURIComponent(buildWhatsAppMessage())}`;
      window.open(whatsappUrl, "_blank");

      toast.success("Commande envoyée ! Redirection vers WhatsApp...");
      handleClose();
    } catch (e) {
      console.error("Error saving order:", e);
      toast.error("Erreur lors de l'envoi de la commande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedSupplements({});
    setQuantity(1);
    setSelectedSize(taco?.sizes?.[0] || null);
    setMeatChoice(null);
    setDeliveryType(null);
    setDeliveryAddress("");
    setPhoneNumber("+223");
    onClose();
  };

  const supplementItems = supplements.filter(s => s.category === "supplement");
  const boissonItems = supplements.filter(s => s.category === "boisson");
  const hasSizes = taco.sizes && taco.sizes.length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Personnaliser votre commande</DialogTitle>
        </DialogHeader>

        {/* Taco Info */}
        <div className="flex gap-4 items-center p-4 bg-accent rounded-lg">
          <img
            src={taco.image}
            alt={taco.name}
            className="w-20 h-20 object-cover object-center rounded-lg"
          />
          <div className="flex-1">
            <h3 className="font-bold text-foreground">{taco.name}</h3>
            <p className="text-primary font-bold">
              {(selectedSize?.price || taco.price).toLocaleString()} FCFA
            </p>
          </div>
        </div>

        {/* Size Selection */}
        {hasSizes && (
          <div className="p-4 bg-muted rounded-lg">
            <span className="font-bold text-primary mb-3 block">Choisir la taille</span>
            <div className="flex gap-3">
              {taco.sizes!.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size)}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                    selectedSize?.name === size.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:bg-accent"
                  }`}
                >
                  <div className="text-lg">{size.name}</div>
                  <div className="text-sm opacity-80">{size.price.toLocaleString()} FCFA</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meat Choice for Pané Miel */}
        {taco.requiresMeatChoice && (
          <div className="p-4 bg-muted rounded-lg">
            <span className="font-bold text-primary mb-3 block">Choisir la viande *</span>
            <div className="flex gap-3">
              <button
                onClick={() => setMeatChoice("viande")}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                  meatChoice === "viande"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-accent"
                }`}
              >
                Viande
              </button>
              <button
                onClick={() => setMeatChoice("poulet")}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                  meatChoice === "poulet"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-accent"
                }`}
              >
                Poulet
              </button>
            </div>
            {taco.requiresMeatChoice && !meatChoice && (
              <p className="text-destructive text-sm mt-2">* Veuillez choisir viande ou poulet</p>
            )}
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="font-medium">Quantité</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="bg-card p-2 rounded-full hover:bg-accent transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-bold text-lg w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="bg-primary text-primary-foreground p-2 rounded-full hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Supplements with images */}
        <div>
          <h4 className="font-bold mb-3 text-primary">Suppléments</h4>
          <div className="grid grid-cols-2 gap-2">
            {supplementItems.map((supplement) => (
              <div
                key={supplement.id}
                className="flex flex-col items-center p-3 bg-muted rounded-lg"
              >
                {supplement.image && (
                  <img
                    src={supplement.image}
                    alt={supplement.name}
                    className="w-12 h-12 object-contain mb-2"
                  />
                )}
                <span className="font-medium text-sm text-center">{supplement.name}</span>
                <span className="text-muted-foreground text-xs">
                  +{supplement.price} FCFA
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleSupplementChange(supplement.id, -1)}
                    className="bg-card p-1.5 rounded-full hover:bg-accent transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-medium w-6 text-center">
                    {selectedSupplements[supplement.id] || 0}
                  </span>
                  <button
                    onClick={() => handleSupplementChange(supplement.id, 1)}
                    className="bg-primary text-primary-foreground p-1.5 rounded-full hover:opacity-90 transition-opacity"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boissons */}
        <div>
          <h4 className="font-bold mb-3 text-primary">Boissons</h4>
          <div className="space-y-2">
            {boissonItems.map((boisson) => (
              <div
                key={boisson.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <span className="font-medium">{boisson.name}</span>
                  <span className="text-muted-foreground text-sm ml-2">
                    +{boisson.price} FCFA
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSupplementChange(boisson.id, -1)}
                    className="bg-card p-1.5 rounded-full hover:bg-accent transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-medium w-6 text-center">
                    {selectedSupplements[boisson.id] || 0}
                  </span>
                  <button
                    onClick={() => handleSupplementChange(boisson.id, 1)}
                    className="bg-primary text-primary-foreground p-1.5 rounded-full hover:opacity-90 transition-opacity"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Type */}
        <div className="p-4 bg-muted rounded-lg">
          <span className="font-bold text-primary mb-3 block">Livraison ou je viendrais récupérer ? *</span>
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
              placeholder="Votre adresse de livraison..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full mt-3 p-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground"
            />
          )}
          {!deliveryType && (
            <p className="text-destructive text-sm mt-2">* Veuillez choisir</p>
          )}
          {deliveryType === "livraison" && !deliveryAddress.trim() && (
            <p className="text-destructive text-sm mt-2">* Veuillez entrer votre adresse</p>
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

        {/* Total & Order Button */}
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold">Total</span>
            <span className="text-xl font-bold text-primary">
              {calculateTotal().toLocaleString()} FCFA
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
            💵 Paiement à la livraison
          </p>
          
          <button
            onClick={handleOrder}
            disabled={
              (taco.requiresMeatChoice && !meatChoice) || 
              !deliveryType || 
              (deliveryType === "livraison" && !deliveryAddress.trim()) || 
              !isPhoneValid() ||
              isSubmitting
            }
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

export default OrderModal;
