import { Truck, Award, Users, Star } from "lucide-react";

const TrustSection = () => {
  const trustItems = [
    {
      icon: Truck,
      text: "Livraison rapide à Bamako de 9h à 4h du matin",
    },
    {
      icon: Award,
      text: "Tacos de qualité",
    },
    {
      icon: Users,
      text: "Déjà +800 clients satisfaits",
    },
  ];

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-card"
            >
              <div className="bg-primary/10 p-3 rounded-full">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="font-medium text-foreground">✔ {item.text}</span>
            </div>
          ))}
        </div>

        {/* Google Reviews Link */}
        <div className="text-center">
          <a
            href="https://www.google.com/maps/place/Magnambougou,+Bamako,+Mali"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-card px-6 py-3 rounded-xl shadow-card hover:shadow-hover transition-all group"
          >
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="font-medium text-foreground group-hover:text-primary transition-colors">
              Voir nos avis sur Google Maps
            </span>
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
