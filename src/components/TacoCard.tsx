import { ShoppingCart } from "lucide-react";

interface TacoCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  onClick: () => void;
}

const TacoCard = ({ name, description, price, image, onClick }: TacoCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-accent">
        <img
          src={image}
          alt={name}
          className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
        />
        {/* Cart Button - Enhanced Duolingo style */}
        <button
          className="absolute top-3 right-3 bg-primary text-primary-foreground p-2.5 rounded-full 
            shadow-[0_4px_0_0_hsl(var(--primary)/0.7)] 
            hover:shadow-[0_6px_0_0_hsl(var(--primary)/0.7)] hover:-translate-y-0.5
            active:shadow-[0_1px_0_0_hsl(var(--primary)/0.7)] active:translate-y-1
            transition-all duration-100 ease-out"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <ShoppingCart className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg text-foreground">{name}</h3>
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
            {price.toLocaleString()} FCFA
          </span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

export default TacoCard;
