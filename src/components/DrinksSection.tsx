import promoImage from "@/assets/promo-drinks.jpg";

const drinks = [
  { id: "7up", name: "7UP Canette", price: 750, emoji: "🥤" },
  { id: "kirene", name: "Eau Minérale Kirene 50cl", price: 500, emoji: "💧" },
  { id: "mirinda-fruity", name: "Mirinda Fruity 300ml", price: 750, emoji: "🍊" },
  { id: "mirinda-canette", name: "Mirinda Fruity Canette", price: 750, emoji: "🥫" },
  { id: "mirinda-1l", name: "Mirinda Orange 1.25L", price: 1200, emoji: "🍹" },
  { id: "mirinda-300", name: "Mirinda Orange 300ml", price: 750, emoji: "🧃" },
  { id: "pepsi", name: "Pepsi 1.25L", price: 1200, emoji: "🥤" },
  { id: "coca", name: "Coca-Cola", price: 500, emoji: "🥤" },
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
              {/* Image placeholder with emoji */}
              <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center">
                <span className="text-5xl">{drink.emoji}</span>
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
