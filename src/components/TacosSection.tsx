import { useState } from "react";
import TacoCard from "./TacoCard";
import OrderModal from "./OrderModal";

import tacosSaumon from "@/assets/tacos-saumon.jpeg";
import tacosCrevettes from "@/assets/tacos-crevettes.jpeg";
import tacosViande from "@/assets/tacos-viande.jpeg";
import tacosHotdog from "@/assets/tacos-hotdog.jpeg";
import tacosCrevettes2 from "@/assets/tacos-crevettes-2.jpeg";

interface TacosSectionProps {
  searchQuery: string;
}

const tacos = [
  {
    id: "saumon",
    name: "Tacos Saumon",
    description: "Délicieux tacos grillé avec du saumon frais, sauce fromagère et frites croustillantes",
    price: 7000,
    image: tacosSaumon,
  },
  {
    id: "crevettes",
    name: "Tacos Crevettes",
    description: "Tacos aux crevettes fraîches avec sauce spéciale maison et fromage fondant",
    price: 8500,
    image: tacosCrevettes,
  },
  {
    id: "crevettes-menu",
    name: "Tacos Crevettes Menu",
    description: "Tacos crevettes avec frites et boisson incluses",
    price: 7500,
    image: tacosCrevettes2,
  },
  {
    id: "viande",
    name: "Tacos Viande",
    description: "Tacos classique avec viande hachée savoureuse, fromage et sauce maison",
    price: 5000,
    image: tacosViande,
  },
  {
    id: "hotdog",
    name: "Tacos Hotdog",
    description: "Original tacos avec saucisse hotdog, fromage coulant et frites",
    price: 5000,
    image: tacosHotdog,
  },
];

const TacosSection = ({ searchQuery }: TacosSectionProps) => {
  const [selectedTaco, setSelectedTaco] = useState<typeof tacos[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTacos = tacos.filter(
    (taco) =>
      taco.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      taco.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTacoClick = (taco: typeof tacos[0]) => {
    setSelectedTaco(taco);
    setIsModalOpen(true);
  };

  return (
    <section id="tacos" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Nos <span className="text-primary">Tacos</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Découvrez notre sélection de tacos grillés préparés avec amour et des ingrédients de qualité
          </p>
        </div>

        {filteredTacos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTacos.map((taco, index) => (
              <div
                key={taco.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <TacoCard
                  {...taco}
                  onClick={() => handleTacoClick(taco)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Aucun tacos trouvé pour "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taco={selectedTaco}
      />
    </section>
  );
};

export default TacosSection;
