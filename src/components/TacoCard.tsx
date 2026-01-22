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
      <div className="relative aspect-square overflow-hidden bg-accent">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        {/* Cart Button - Duolingo style bounce */}
        <button
          className="absolute top-3 right-3 bg-primary text-primary-foreground p-2.5 rounded-full shadow-lg 
            hover:scale-110 active:scale-95 transition-all duration-150
            hover:shadow-[0_6px_0_0] hover:shadow-primary/50 hover:-translate-y-0.5
            active:shadow-none active:translate-y-0"
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
