const drinks = [
  { id: "7up", name: "7UP Canette", price: 750 },
  { id: "kirene", name: "Eau Minérale Kirene 50cl", price: 500 },
  { id: "mirinda-fruity", name: "Mirinda Fruity 300ml", price: 750 },
  { id: "mirinda-canette", name: "Mirinda Fruity Canette", price: 750 },
  { id: "mirinda-1l", name: "Mirinda Orange 1.25L", price: 1200 },
  { id: "mirinda-300", name: "Mirinda Orange 300ml", price: 750 },
  { id: "pepsi", name: "Pepsi 1.25L", price: 1200 },
  { id: "coca", name: "Coca-Cola", price: 500 },
];

const supplements = [
  { id: "bucket", name: "Supplément Bucket", description: "Boisson + Frites", price: 3000 },
  { id: "fromage", name: "Fromage", description: "Supplément de fromage", price: 250 },
  { id: "frites-large", name: "Portion de frites large", description: "Portion de Frites", price: 1500 },
  { id: "frites-simple", name: "Portion de frites simple", description: "Portion de frites simple", price: 1000 },
  { id: "oeuf", name: "Oeuf Nature", description: "Oeuf entier", price: 500 },
  { id: "sauce", name: "Sauce Extra", description: "Sauce supplémentaire", price: 200 },
];

const DrinksSection = () => {
  return (
    <section id="boissons" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Boissons */}
        <div className="mb-16">
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
                className="bg-card p-4 rounded-xl shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in relative"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col h-full">
                  <div className="h-24 flex items-center justify-center mb-3">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-2xl">🥤</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <p className="text-lg font-extrabold text-foreground mb-1">
                      {drink.price.toLocaleString()} FCFA
                    </p>
                    <p className="text-sm font-medium text-foreground">{drink.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suppléments */}
        <div>
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground uppercase tracking-wide">
              Suppléments
            </h2>
            <div className="w-full h-0.5 bg-border mt-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {supplements.map((item, index) => (
              <div
                key={item.id}
                className="bg-card p-4 rounded-xl shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in relative"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col h-full">
                  <div className="h-24 flex items-center justify-center mb-3">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-2xl">
                        {item.id.includes("frites") ? "🍟" : item.id === "fromage" ? "🧀" : item.id === "oeuf" ? "🥚" : item.id === "sauce" ? "🥫" : "🍽️"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <p className="text-lg font-extrabold text-foreground mb-1">
                      {item.price.toLocaleString()} FCFA
                    </p>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground italic">
              * Les suppléments et boissons sont disponibles à ajouter lors de votre commande de tacos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DrinksSection;
