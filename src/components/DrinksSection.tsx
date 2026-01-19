import drinkCoca from "@/assets/drink-coca.png";
import drink7up from "@/assets/drink-7up.png";
import drinkDjino from "@/assets/drink-djino.png";
import drinkLimonade from "@/assets/drink-limonade.png";
import drinkPresseaMangue from "@/assets/drink-pressea-mangue.png";
import drinkPresseaCoco from "@/assets/drink-pressea-coco.png";
import drinkKirene from "@/assets/drink-kirene.png";

const drinks = [
  { id: "coca", name: "Coca-Cola 33cl", price: 500, image: drinkCoca },
  { id: "7up", name: "7UP Canette", price: 750, image: drink7up },
  { id: "djino", name: "D'jino Cocktail de Fruits", price: 750, image: drinkDjino },
  { id: "limonade", name: "Limonade Citron Vert", price: 500, image: drinkLimonade },
  { id: "pressea-mangue", name: "Pressea Fresh Mangue", price: 750, image: drinkPresseaMangue },
  { id: "pressea-coco", name: "Pressea Fresh Mangue Coco", price: 750, image: drinkPresseaCoco },
  { id: "kirene", name: "Eau Kirène 50cl", price: 500, image: drinkKirene },
];

const DrinksSection = () => {
  return (
    <section id="boissons" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Boissons */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground uppercase tracking-wide">
            Boissons
          </h2>
          <div className="w-full h-0.5 bg-border mt-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {drinks.map((drink, index) => (
            <div
              key={drink.id}
              className="bg-card rounded-xl shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Image */}
              <div className="h-40 bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center p-4">
                <img 
                  src={drink.image} 
                  alt={drink.name}
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="p-4">
                <p className="text-lg font-extrabold text-primary mb-1">
                  {drink.price.toLocaleString()} FCFA
                </p>
                <p className="text-sm font-medium text-foreground">{drink.name}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground italic">
            * Les boissons sont disponibles à ajouter lors de votre commande de tacos
          </p>
        </div>
      </div>
    </section>
  );
};

export default DrinksSection;
