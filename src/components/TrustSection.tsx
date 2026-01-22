import { Zap, Shield, Heart } from "lucide-react";

const TrustSection = () => {
  const trustItems = [
    {
      icon: Zap,
      title: "Livraison Express",
      text: "De 9h à 4h du matin à Bamako",
    },
    {
      icon: Shield,
      title: "Qualité Premium",
      text: "Ingrédients frais sélectionnés",
    },
    {
      icon: Heart,
      title: "+800 Clients",
      text: "Satisfaits et fidèles",
    },
  ];

  return (
    <section className="py-10 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-primary-foreground"
            >
              <div className="bg-primary p-2 rounded-lg">
                <item.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-xs opacity-70">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
