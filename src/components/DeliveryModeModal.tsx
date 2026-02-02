import { useState } from "react";
import { Truck, Store, UtensilsCrossed } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DeliveryMode } from "./TopBar";

interface DeliveryModeModalProps {
  isOpen: boolean;
  onSelect: (mode: DeliveryMode, address?: string) => void;
  onViewMenu: () => void;
}

const DeliveryModeModal = ({ isOpen, onSelect, onViewMenu }: DeliveryModeModalProps) => {
  const [selectedMode, setSelectedMode] = useState<"livraison" | "emporter" | null>(null);
  const [address, setAddress] = useState("");

  const handleLivraisonClick = () => {
    setSelectedMode("livraison");
  };

  const handleEmporterClick = () => {
    onSelect("emporter");
  };

  const handleConfirmLivraison = () => {
    if (address.trim()) {
      onSelect("livraison", address.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md" 
        hideCloseButton
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-extrabold text-center">
            Bienvenue chez <span className="text-primary">MM TACOS</span>
          </DialogTitle>
        </DialogHeader>

        <p className="text-center text-muted-foreground mb-4">
          Comment souhaitez-vous récupérer votre commande ?
        </p>

        <div className="space-y-3">
          {/* Livraison */}
          <button
            onClick={handleLivraisonClick}
            className={`w-full flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-200 border-2 ${
              selectedMode === "livraison"
                ? "bg-primary/10 border-primary"
                : "bg-muted border-transparent hover:bg-accent hover:border-primary/50"
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              selectedMode === "livraison" ? "bg-primary/20" : "bg-primary/10"
            }`}>
              <Truck className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-foreground">Livraison</h3>
              <p className="text-sm text-muted-foreground">
                On vous livre chez vous
              </p>
            </div>
          </button>

          {/* Address input for livraison */}
          {selectedMode === "livraison" && (
            <div className="px-2 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <input
                type="text"
                placeholder="Entrez votre adresse de livraison..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <button
                onClick={handleConfirmLivraison}
                disabled={!address.trim()}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmer l'adresse
              </button>
            </div>
          )}

          {/* Sur place */}
          <button
            onClick={handleEmporterClick}
            className="w-full flex flex-col items-center gap-3 p-5 bg-muted rounded-2xl hover:bg-accent transition-all duration-200 border-2 border-transparent hover:border-primary/50"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
              <Store className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-foreground">Je viendrais récupérer</h3>
              <p className="text-sm text-muted-foreground">
                Retrait sur place
              </p>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Vous pourrez changer ce choix à tout moment depuis la barre en haut
        </p>

        {/* Voir le Menu button */}
        <button
          onClick={onViewMenu}
          className="w-full mt-2 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <UtensilsCrossed className="w-5 h-5" />
          Voir le Menu
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryModeModal;
