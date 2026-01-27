import { useState } from "react";
import { Building2, MessageCircle, Users, Check } from "lucide-react";
import EnterpriseMenuOrderModal from "./EnterpriseMenuOrderModal";

import enterpriseImg1 from "@/assets/enterprise-menu-1.jpeg";
import enterpriseImg2 from "@/assets/enterprise-menu-2.jpeg";
import enterpriseImg3 from "@/assets/enterprise-menu-3.jpeg";

interface EnterpriseMenu {
  id: string;
  quantity: number;
  price: number;
  pricePerMenu: number;
  image: string;
  features: string[];
}

const enterpriseMenus: EnterpriseMenu[] = [
  { 
    id: "enterprise-20", 
    quantity: 20, 
    price: 88000, 
    pricePerMenu: 4400,
    image: enterpriseImg1,
    features: ["Tacos viande ou poulet", "Sauce fromagère", "Frites + Boisson"]
  },
  { 
    id: "enterprise-25", 
    quantity: 25, 
    price: 108000, 
    pricePerMenu: 4320,
    image: enterpriseImg1,
    features: ["Tacos viande ou poulet", "Sauce fromagère", "Frites + Boisson"]
  },
  { 
    id: "enterprise-30", 
    quantity: 30, 
    price: 129000, 
    pricePerMenu: 4300,
    image: enterpriseImg2,
    features: ["Tacos viande ou poulet", "Sauce fromagère", "Frites + Boisson"]
  },
  { 
    id: "enterprise-35", 
    quantity: 35, 
    price: 148000, 
    pricePerMenu: 4229,
    image: enterpriseImg2,
    features: ["Tacos viande ou poulet", "Sauce fromagère", "Frites + Boisson"]
  },
  { 
    id: "enterprise-40", 
    quantity: 40, 
    price: 166000, 
    pricePerMenu: 4150,
    image: enterpriseImg3,
    features: ["Tacos viande ou poulet", "Sauce fromagère", "Frites + Boisson"]
  },
  { 
    id: "enterprise-50", 
    quantity: 50, 
    price: 205000, 
    pricePerMenu: 4100,
    image: enterpriseImg3,
    features: ["Tacos viande ou poulet", "Sauce fromagère", "Frites + Boisson"]
  },
];

const EnterpriseMenuSection = () => {
  const [selectedMenu, setSelectedMenu] = useState<EnterpriseMenu | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMenuClick = (menu: EnterpriseMenu) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
  };

  return (
    <section id="menu-entreprise" className="py-16 bg-accent/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Building2 className="h-5 w-5" />
            <span className="font-bold">Menu Entreprise / Groupe</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Menu Entreprise – <span className="text-primary">MM TACOS</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            À partir de 20 menus complets : <strong>Tacos + Frites + Boisson</strong>
          </p>
          <p className="text-primary font-bold mt-2">
            Idéal pour séminaires, événements d'entreprise, célébrations
          </p>
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {enterpriseMenus.map((menu, index) => (
            <div
              key={menu.id}
              onClick={() => handleMenuClick(menu)}
              className="relative bg-card rounded-2xl shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden cursor-pointer animate-fade-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={menu.image}
                  alt={`${menu.quantity} menus entreprise`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <div>
                    <div className="text-4xl font-extrabold text-white">
                      {menu.quantity}
                    </div>
                    <div className="text-sm font-medium text-white/80">menus</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-white">
                      {menu.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/80">FCFA</div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* Features */}
                <ul className="space-y-1 mb-4">
                  {menu.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Order Button */}
                <button
                  className="w-full bg-[#25D366] text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 
                    shadow-[0_3px_0_0] shadow-[#1da851]
                    hover:-translate-y-0.5 hover:shadow-[0_5px_0_0] hover:shadow-[#1da851]
                    active:translate-y-0 active:shadow-none
                    transition-all duration-150 text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  Commander
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12 space-y-2">
          <p className="text-foreground font-bold text-lg">
            Plus vous prenez, plus vous économisez !
          </p>
          <p className="text-muted-foreground">
            Menus complets disponibles pour familles, entreprises et événements
          </p>
        </div>
      </div>

      <EnterpriseMenuOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menu={selectedMenu}
      />
    </section>
  );
};

export default EnterpriseMenuSection;
