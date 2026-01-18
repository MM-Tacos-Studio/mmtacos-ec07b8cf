import { useState } from "react";
import { X, Plus, Minus, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Supplement {
  id: string;
  name: string;
  price: number;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  taco: {
    name: string;
    price: number;
    image: string;
  } | null;
}

const supplements: Supplement[] = [
  { id: "frites", name: "Frites", price: 500 },
  { id: "coca", name: "Coca-Cola", price: 500 },
  { id: "sprite", name: "Sprite", price: 500 },
  { id: "fanta", name: "Fanta", price: 500 },
  { id: "eau", name: "Eau minérale", price: 300 },
  { id: "sauce-extra", name: "Sauce supplémentaire", price: 200 },
];

const OrderModal = ({ isOpen, onClose, taco }: OrderModalProps) => {
  const [selectedSupplements, setSelectedSupplements] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);

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
    const supplementsTotal = Object.entries(selectedSupplements).reduce(
      (sum, [id, qty]) => {
        const supplement = supplements.find((s) => s.id === id);
        return sum + (supplement?.price || 0) * qty;
      },
      0
    );
    return (taco.price + supplementsTotal) * quantity;
  };

  const handleOrder = () => {
    const supplementsList = Object.entries(selectedSupplements)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const supplement = supplements.find((s) => s.id === id);
        return `${qty}x ${supplement?.name}`;
      })
      .join(", ");

    const message = `Bonjour! Je voudrais commander:
    
🌮 ${quantity}x ${taco.name} (${taco.price.toLocaleString()} FCFA)
${supplementsList ? `➕ Suppléments: ${supplementsList}` : ""}

💰 Total: ${calculateTotal().toLocaleString()} FCFA

Merci!`;

    const whatsappUrl = `https://wa.me/22384437961?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    onClose();
  };

  const handleClose = () => {
    setSelectedSupplements({});
    setQuantity(1);
    onClose();
  };

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
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="font-bold text-foreground">{taco.name}</h3>
            <p className="text-primary font-bold">{taco.price.toLocaleString()} FCFA</p>
          </div>
        </div>

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

        {/* Supplements */}
        <div>
          <h4 className="font-bold mb-3">Ajouter des suppléments</h4>
          <div className="space-y-2">
            {supplements.map((supplement) => (
              <div
                key={supplement.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <span className="font-medium">{supplement.name}</span>
                  <span className="text-muted-foreground text-sm ml-2">
                    +{supplement.price} FCFA
                  </span>
                </div>
                <div className="flex items-center gap-2">
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

        {/* Total & Order Button */}
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold">Total</span>
            <span className="text-xl font-bold text-primary">
              {calculateTotal().toLocaleString()} FCFA
            </span>
          </div>
          <button
            onClick={handleOrder}
            className="w-full bg-[#25D366] text-primary-foreground py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-5 w-5" />
            Commander via WhatsApp
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
