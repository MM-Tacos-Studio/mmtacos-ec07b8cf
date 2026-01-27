import { useState } from "react";
import { Building2, MessageCircle, TrendingDown } from "lucide-react";
import EnterpriseMenuOrderModal from "./EnterpriseMenuOrderModal";

interface EnterpriseMenu {
  id: string;
  quantity: number;
  price: number;
  pricePerMenu: number;
}

const enterpriseMenus: EnterpriseMenu[] = [
  { id: "enterprise-20", quantity: 20, price: 88000, pricePerMenu: 4400 },
  { id: "enterprise-25", quantity: 25, price: 108000, pricePerMenu: 4320 },
  { id: "enterprise-30", quantity: 30, price: 129000, pricePerMenu: 4300 },
  { id: "enterprise-35", quantity: 35, price: 148000, pricePerMenu: 4229 },
  { id: "enterprise-40", quantity: 40, price: 166000, pricePerMenu: 4150 },
  { id: "enterprise-50", quantity: 50, price: 205000, pricePerMenu: 4100 },
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
            Tacos viande ou poulet, sauce fromagère, frites à l'intérieur + accompagnement
          </p>
        </div>

        {/* Pricing Table */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-primary text-primary-foreground font-bold text-center py-4">
              <div>Quantité</div>
              <div>Prix Total</div>
              <div>Prix/Menu</div>
            </div>

            {/* Table Body */}
            {enterpriseMenus.map((menu, index) => (
              <div
                key={menu.id}
                className={`grid grid-cols-3 text-center py-4 items-center border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer animate-fade-in ${
                  index % 2 === 0 ? "bg-background" : "bg-card"
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => handleMenuClick(menu)}
              >
                <div className="font-bold text-lg text-foreground">
                  {menu.quantity} menus
                </div>
                <div className="font-extrabold text-primary text-lg">
                  {menu.price.toLocaleString()} FCFA
                </div>
                <div className="flex items-center justify-center gap-1 text-green-600 font-medium">
                  <TrendingDown className="h-4 w-4" />
                  {menu.pricePerMenu.toLocaleString()} FCFA
                </div>
              </div>
            ))}
          </div>

          {/* Quick Order Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            {enterpriseMenus.map((menu, index) => (
              <button
                key={menu.id}
                onClick={() => handleMenuClick(menu)}
                className="bg-card hover:bg-accent border border-border rounded-xl p-4 transition-all duration-300 hover:shadow-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="text-2xl font-extrabold text-primary mb-1">
                  {menu.quantity}
                </div>
                <div className="text-sm text-muted-foreground mb-2">menus</div>
                <div className="text-lg font-bold text-foreground">
                  {menu.price.toLocaleString()} FCFA
                </div>
                <div className="flex items-center justify-center gap-2 mt-3 text-[#25D366] font-medium text-sm">
                  <MessageCircle className="h-4 w-4" />
                  Commander
                </div>
              </button>
            ))}
          </div>
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
