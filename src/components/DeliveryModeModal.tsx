import { Truck, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DeliveryMode } from "./TopBar";

interface DeliveryModeModalProps {
  isOpen: boolean;
  onSelect: (mode: DeliveryMode) => void;
}

const DeliveryModeModal = ({ isOpen, onSelect }: DeliveryModeModalProps) => {
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

        <p className="text-center text-muted-foreground mb-6">
          Comment souhaitez-vous récupérer votre commande ?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Livraison */}
          <button
            onClick={() => onSelect("livraison")}
            className="flex flex-col items-center gap-3 p-6 bg-muted rounded-2xl hover:bg-accent transition-all duration-200 group border-2 border-transparent hover:border-primary"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-foreground">Livraison</h3>
              <p className="text-sm text-muted-foreground">
                On vous livre chez vous
              </p>
            </div>
          </button>

          {/* Sur place */}
          <button
            onClick={() => onSelect("emporter")}
            className="flex flex-col items-center gap-3 p-6 bg-muted rounded-2xl hover:bg-accent transition-all duration-200 group border-2 border-transparent hover:border-primary"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-foreground">Je viendrais récupérer</h3>
              <p className="text-sm text-muted-foreground">
                Retrait sur place
              </p>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Vous pourrez changer ce choix à tout moment depuis la barre en haut
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryModeModal;
