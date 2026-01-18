import promoDrinks from "@/assets/promo-drinks.jpg";

const drinks = [
  { id: "coca", name: "Coca-Cola", price: 500 },
  { id: "sprite", name: "Sprite", price: 500 },
  { id: "fanta", name: "Fanta Orange", price: 500 },
  { id: "eau", name: "Eau Minérale", price: 300 },
  { id: "jus-orange", name: "Jus d'Orange", price: 700 },
  { id: "jus-mangue", name: "Jus de Mangue", price: 700 },
];

const DrinksSection = () => {
  return (
    <section id="boissons" className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Nos <span className="text-primary">Boissons</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Rafraîchissez-vous avec notre sélection de boissons fraîches
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-card animate-fade-in">
            <img
              src={promoDrinks}
              alt="Nos boissons fraîches"
              className="w-full h-[300px] object-cover"
            />
          </div>

          {/* Drinks List */}
          <div className="grid grid-cols-2 gap-4">
            {drinks.map((drink, index) => (
              <div
                key={drink.id}
                className="bg-card p-4 rounded-xl shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{drink.name}</span>
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold">
                    {drink.price} FCFA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground italic">
            * Les boissons sont disponibles en supplément avec vos tacos
          </p>
        </div>
      </div>
    </section>
  );
};

export default DrinksSection;
