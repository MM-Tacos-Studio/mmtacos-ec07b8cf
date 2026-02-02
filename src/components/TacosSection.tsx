import { useState } from "react";
import TacoCard from "./TacoCard";
import OrderModal from "./OrderModal";

import tacosViande from "@/assets/tacos-viande-new.jpeg";
import tacosPoulet from "@/assets/tacos-poulet.jpeg";
import tacosMix from "@/assets/tacos-mix.jpeg";
import tacosKfc from "@/assets/tacos-kfc.jpeg";
import tacosCordonBleu from "@/assets/tacos-cordon-bleu.jpeg";
import tacosHotdog from "@/assets/tacos-hotdog-new.jpeg";
import tacosMerguez from "@/assets/tacos-merguez.jpeg";
import tacosCrevettes from "@/assets/tacos-crevettes-2.jpeg";
import tacosSaumon from "@/assets/tacos-saumon-2.jpeg";
import tacosCorNedBeef from "@/assets/tacos-corned-beef.jpeg";
import tacosPaneMiel from "@/assets/tacos-pane-miel.jpeg";
import kfcBox from "@/assets/mm-kfc-box.jpeg";
import { useDeliveryMode } from "@/hooks/useDeliveryMode";

interface TacosSectionProps {
  searchQuery: string;
}

export interface TacoSize {
  name: string;
  price: number;
}

export interface Taco {
  id: string;
  name: string;
  description: string;
  price: number; // Prix de base (taille M)
  image: string;
  sizes?: TacoSize[];
  requiresMeatChoice?: boolean; // Pour Pané Miel
}

const tacos: Taco[] = [
  {
    id: "viande",
    name: "Tacos Viande",
    description: "Viande hachée, sauce fromagère, frites croustillantes",
    price: 4000,
    image: tacosViande,
    sizes: [
      { name: "M", price: 4000 },
      { name: "XL", price: 6500 },
      { name: "XXL", price: 10000 },
    ],
  },
  {
    id: "poulet",
    name: "Tacos Poulet",
    description: "Poulet, sauce fromagère, frites croustillantes",
    price: 4000,
    image: tacosPoulet,
    sizes: [
      { name: "M", price: 4000 },
      { name: "XL", price: 6500 },
      { name: "XXL", price: 10000 },
    ],
  },
  {
    id: "mixte",
    name: "Tacos Mixte",
    description: "Viande et poulet, sauce fromagère, frites croustillantes",
    price: 4000,
    image: tacosMix,
    sizes: [
      { name: "M", price: 4000 },
      { name: "XL", price: 6500 },
      { name: "XXL", price: 10000 },
    ],
  },
  {
    id: "kfc",
    name: "Tacos KFC",
    description: "Poulet croustillant KFC, sauce fromagère, frites croustillantes",
    price: 5000,
    image: tacosKfc,
    sizes: [
      { name: "M", price: 5000 },
      { name: "XL", price: 8000 },
      { name: "XXL", price: 12000 },
    ],
  },
  {
    id: "pane-miel",
    name: "Tacos Pané Miel",
    description: "Au choix viande ou poulet, sauce fromagère, frites, pané, miel",
    price: 5500,
    image: tacosPaneMiel,
    sizes: [
      { name: "M", price: 5500 },
      { name: "XL", price: 8000 },
      { name: "XXL", price: 12000 },
    ],
    requiresMeatChoice: true,
  },
  {
    id: "cordon-bleu",
    name: "Tacos Cordon Bleu",
    description: "Cordon bleu, sauce fromagère, frites croustillantes",
    price: 5000,
    image: tacosCordonBleu,
    sizes: [
      { name: "M", price: 5000 },
      { name: "XL", price: 6500 },
      { name: "XXL", price: 12000 },
    ],
  },
  {
    id: "hotdog",
    name: "Tacos Hotdog",
    description: "Saucisse hotdog poulet, sauce fromagère, frites croustillantes",
    price: 4000,
    image: tacosHotdog,
    sizes: [
      { name: "M", price: 4000 },
      { name: "XL", price: 6500 },
      { name: "XXL", price: 10000 },
    ],
  },
  {
    id: "merguez",
    name: "Tacos Merguez",
    description: "Merguez grillée, sauce fromagère, frites croustillantes",
    price: 4000,
    image: tacosMerguez,
    sizes: [
      { name: "M", price: 4000 },
      { name: "XL", price: 6500 },
      { name: "XXL", price: 10000 },
    ],
  },
  {
    id: "crevettes",
    name: "Tacos Crevettes",
    description: "Crevettes sautées, sauce fromagère, frites croustillantes",
    price: 7500,
    image: tacosCrevettes,
    sizes: [
      { name: "M", price: 7500 },
      { name: "XL", price: 12500 },
      { name: "XXL", price: 18500 },
    ],
  },
  {
    id: "saumon",
    name: "Tacos Saumon",
    description: "Saumon fumé, sauce fromagère, frites croustillantes",
    price: 6000,
    image: tacosSaumon,
    sizes: [
      { name: "M", price: 6000 },
      { name: "XL", price: 8000 },
      { name: "XXL", price: 12000 },
    ],
  },
  {
    id: "corned-beef",
    name: "Tacos Corned-Beef",
    description: "Corned-beef, sauce fromagère, frites croustillantes",
    price: 4000,
    image: tacosCorNedBeef,
    sizes: [
      { name: "M", price: 4000 },
      { name: "XL", price: 6500 },
      { name: "XXL", price: 10000 },
    ],
  },
  {
    id: "kfc-box",
    name: "MM'KFC Box",
    description: "3 pièces de poulet croustillant + frites croustillantes + boisson",
    price: 5000,
    image: kfcBox,
  },
];

const TacosSection = ({ searchQuery }: TacosSectionProps) => {
  const [selectedTaco, setSelectedTaco] = useState<Taco | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { deliveryMode, deliveryAddress } = useDeliveryMode();

  const filteredTacos = tacos.filter(
    (taco) =>
      taco.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      taco.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTacoClick = (taco: Taco) => {
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
        initialDeliveryMode={deliveryMode}
        initialDeliveryAddress={deliveryAddress}
      />
    </section>
  );
};

export default TacosSection;
