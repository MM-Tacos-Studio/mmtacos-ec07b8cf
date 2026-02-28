import { Search, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import heroBanner from "@/assets/hero-banner.jpg";
import heroTacos1 from "@/assets/hero-tacos-1.jpeg";
import heroTacos2 from "@/assets/hero-tacos-2.jpeg";
import heroTacos3 from "@/assets/hero-tacos-3.jpeg";

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

const heroImages = [
  { src: heroTacos3, alt: "Menu complet MM Tacos" },
  { src: heroBanner, alt: "Délicieux tacos MM Tacos" },
  { src: heroTacos1, alt: "Tacos grillé croustillant MM Tacos" },
  { src: heroTacos2, alt: "Commande MM Tacos avec frites et poulet" },
];

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    setProgress(0);
  }, []);

  // Auto-slide every 5 seconds with progress bar
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + 2; // 50 steps * 100ms = 5000ms
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [nextSlide]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  return (
    <section id="accueil">
      {/* Hero Carousel - Full Screen on Mobile */}
      <div className="relative h-[90vh] md:h-[75vh] overflow-hidden">
        {/* Images */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center center" }}
            />
          </div>
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/20" />

        {/* Progress Indicators - O'Tacos Style */}
        <div className="absolute top-20 md:top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative h-1.5 rounded-full overflow-hidden bg-primary-foreground/30 transition-all duration-300"
              style={{ width: index === currentSlide ? "48px" : "8px" }}
              aria-label={`Aller au slide ${index + 1}`}
            >
              {index === currentSlide && (
                <div
                  className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Hero Content - Bottom aligned for mobile */}
        <div className="absolute inset-0 flex items-end pb-12 md:items-center md:pb-0">
          <div className="container mx-auto px-4">
            <div className="max-w-lg text-primary-foreground text-center md:text-left mx-auto md:mx-0">
              <h1 className="text-3xl md:text-5xl font-extrabold mb-3 animate-fade-in drop-shadow-lg">
                Les meilleurs Tacos de Bamako
              </h1>
              <p className="text-base md:text-xl opacity-90 mb-6 animate-fade-in drop-shadow-md" style={{ animationDelay: "0.1s" }}>
                Savourez l'authentique goût français • Livraison 9h-4h
              </p>
              <div className="animate-fade-in flex flex-col sm:flex-row gap-3 justify-center md:justify-start" style={{ animationDelay: "0.2s" }}>
                <a
                  href="#tacos"
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg 
                    inline-block shadow-[0_4px_0_0_hsl(var(--primary)/0.7)]
                    hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_hsl(var(--primary)/0.7)]
                    active:translate-y-1 active:shadow-[0_1px_0_0_hsl(var(--primary)/0.7)]
                    transition-all duration-150"
                >
                  Voir le Menu
                </a>
                <a
                  href="tel:+22378952678"
                  className="bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground px-8 py-4 rounded-full font-bold text-lg 
                    inline-block border-2 border-primary-foreground/40
                    hover:bg-primary-foreground/30
                    active:bg-primary-foreground/10
                    transition-all duration-150"
                >
                  Commander
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <ChevronDown className="h-8 w-8 text-primary-foreground/70" />
        </div>
      </div>

      {/* Search Bar - Below hero */}
      <div className="bg-muted py-6 md:py-8">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch} className="bg-card rounded-xl shadow-card p-3 md:p-4 max-w-2xl mx-auto">
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
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm md:text-base"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm md:text-base
                  shadow-[0_3px_0_0_hsl(var(--primary)/0.7)]
                  hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_hsl(var(--primary)/0.7)]
                  active:translate-y-0 active:shadow-none
                  transition-all duration-150"
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
