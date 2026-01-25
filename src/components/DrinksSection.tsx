const drinks = [
  { id: "boisson", name: "Boisson", price: 500 },
  { id: "menthe-lait", name: "Menthe au lait", price: 500 },
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
              className="bg-card rounded-xl shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in overflow-hidden p-6"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <p className="text-lg font-extrabold text-primary mb-1">
                {drink.price.toLocaleString()} FCFA
              </p>
              <p className="text-sm font-medium text-foreground">{drink.name}</p>
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
