import { Search } from "lucide-react";
import { useState } from "react";
import heroBanner from "@/assets/hero-banner.jpg";

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <section id="accueil">
      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={heroBanner}
          alt="Délicieux tacos MM Tacos"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg text-primary-foreground">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-slide-up">
                Les Meilleurs Tacos de Bamako
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                Savourez nos tacos grillés avec des sauces uniques et des ingrédients frais
              </p>
              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <a
                  href="#tacos"
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity inline-block"
                >
                  Voir le Menu
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar - Below hero */}
      <div className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch} className="bg-card rounded-xl shadow-card p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Rechercher un tacos..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch(e.target.value);
                }}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
