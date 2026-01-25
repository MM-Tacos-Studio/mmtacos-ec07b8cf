import { Phone, Clock } from "lucide-react";

const TopBar = () => {
  return (
    <div className="bg-primary py-2 px-4">
      <div className="container mx-auto flex items-center justify-between text-primary-foreground text-sm">
        <div className="flex items-center gap-4">
          <a href="tel:+22384437961" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Phone className="h-4 w-4" />
            <span className="font-medium">+223 84 43 79 61</span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Ouvert de 9h à 4h du matin</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
