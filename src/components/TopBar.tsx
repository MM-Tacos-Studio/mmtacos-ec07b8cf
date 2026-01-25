import { Phone, Clock } from "lucide-react";

const TopBar = () => {
  return (
    <div className="bg-primary py-2 px-4">
      <div className="container mx-auto flex items-center justify-between text-primary-foreground text-sm">
        <a href="tel:+22373360131" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Phone className="h-4 w-4" />
          <span className="font-medium">+223 73 36 01 31</span>
        </a>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Ouvert de 9h à 4h du matin</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
