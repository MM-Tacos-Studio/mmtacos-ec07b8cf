import { useState } from "react";
import { Users, Gift, Truck, MessageCircle, Check } from "lucide-react";
import FamilyMenuOrderModal from "./FamilyMenuOrderModal";
import type { DeliveryMode } from "./TopBar";

import familyImg1 from "@/assets/family-menu-1.jpeg";
import familyImg2 from "@/assets/family-menu-2.jpeg";
import familyImg3 from "@/assets/family-menu-3.jpeg";
import familyImg4 from "@/assets/family-menu-4.jpeg";

interface FamilyMenuSectionProps {
  deliveryMode: DeliveryMode;
  deliveryAddress: string;
}

interface FamilyMenu {
  id: string;
  quantity: number;
  price: number;
  bonus?: string;
  features: string[];
  popular?: boolean;
  image: string;
}

const familyMenus: FamilyMenu[] = [
  {
    id: "family-5",
    quantity: 5,
    price: 23500,
    features: [
      "Tacos viande ou poulet au choix",
      "Sauce fromagère",
      "Frites croustillantes (dans le tacos + accompagnement)",
      "1 boisson par menu",
    ],
    image: familyImg1,
  },
  {
    id: "family-10",
    quantity: 10,
    price: 46000,
    bonus: "1 boisson offerte",
    features: [
      "Tacos viande ou poulet",
      "Sauce fromagère",
      "Frites croustillantes (dans le tacos + accompagnement)",
      "1 boisson par menu",
    ],
    popular: true,
    image: familyImg2,
  },
  {
    id: "family-15",
    quantity: 15,
    price: 68000,
    features: [
      "Tacos viande ou poulet généreux",
      "Frites croustillantes",
      "Boisson fraîche",
      "Mélange possible viande & poulet",
    ],
    image: familyImg3,
  },
  {
    id: "family-20",
    quantity: 20,
    price: 90000,
    bonus: "2 boissons offertes",
    features: [
      "Tacos au choix (viande ou poulet)",
      "Frites croustillantes",
      "Boisson",
      "Livraison possible selon zone",
    ],
    image: familyImg4,
  },
];

const FamilyMenuSection = ({ deliveryMode, deliveryAddress }: FamilyMenuSectionProps) => {
  const [selectedMenu, setSelectedMenu] = useState<FamilyMenu | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMenuClick = (menu: FamilyMenu) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
  };

  return (
    <section id="menu-familial" className="py-16 bg-gradient-to-b from-background to-accent/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Users className="h-5 w-5" />
            <span className="font-bold">Menu Familial</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Menu Familial – <span className="text-primary">MM TACOS</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Menus complets uniquement : <strong>1 Tacos + Frites + Boisson</strong>
          </p>
          <p className="text-primary font-bold mt-2">
            Idéal pour familles, anniversaires, réunions familiales
          </p>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {familyMenus.map((menu, index) => (
            <div
              key={menu.id}
              className={`relative bg-card rounded-2xl shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden animate-fade-in ${
                menu.popular ? "ring-2 ring-primary" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={menu.image}
                  alt={`${menu.quantity} menus`}
                  className="w-full h-full object-cover"
                />
                {/* Popular Badge */}
                {menu.popular && (
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                    Populaire
                  </div>
                )}
                {/* Bonus Badge */}
                {menu.bonus && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    {menu.bonus}
                  </div>
                )}
              </div>

              <div className="p-5">
                {/* Quantity Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-3xl font-extrabold text-primary">
                      {menu.quantity}
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      Menu{menu.quantity > 1 ? "s" : ""} Tacos
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-foreground">
                      {menu.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">FCFA</div>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-1.5 mb-4">
                  {menu.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Order Button */}
                <button
                  onClick={() => handleMenuClick(menu)}
                  className="w-full bg-[#25D366] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 
                    shadow-[0_4px_0_0] shadow-[#1da851]
                    hover:-translate-y-0.5 hover:shadow-[0_6px_0_0] hover:shadow-[#1da851]
                    active:translate-y-0 active:shadow-none
                    transition-all duration-150"
                >
                  <MessageCircle className="h-5 w-5" />
                  Commander
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Truck className="h-5 w-5" />
            <span>Livraison possible selon zone</span>
          </div>
        </div>
      </div>

      <FamilyMenuOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menu={selectedMenu}
        initialDeliveryMode={deliveryMode}
        initialDeliveryAddress={deliveryAddress}
      />
    </section>
  );
};

export default FamilyMenuSection;
