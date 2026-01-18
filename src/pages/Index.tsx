import { useState } from "react";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TacosSection from "@/components/TacosSection";
import PromoBanner from "@/components/PromoBanner";
import DrinksSection from "@/components/DrinksSection";
import Footer from "@/components/Footer";

import promoBanner1 from "@/assets/promo-banner-1.jpg";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <TopBar />
      
      {/* Navbar */}
      <Navbar />

      {/* Hero Section with Search */}
      <HeroSection onSearch={setSearchQuery} />

      {/* Tacos Section */}
      <TacosSection searchQuery={searchQuery} />

      {/* Promo Banner 1 */}
      <PromoBanner
        image={promoBanner1}
        title="Menu Complet"
        subtitle="Tacos + Frites + Boisson à partir de 5000 FCFA"
        buttonText="Commander Maintenant"
        buttonHref="https://wa.me/22384437961"
      />

      {/* Drinks Section */}
      <DrinksSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
