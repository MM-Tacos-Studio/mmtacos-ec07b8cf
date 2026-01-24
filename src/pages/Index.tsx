import { useState } from "react";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import PromoMarquee from "@/components/PromoMarquee";
import HeroSection from "@/components/HeroSection";
import TrustSection from "@/components/TrustSection";
import TacosSection from "@/components/TacosSection";
import PromoBanner from "@/components/PromoBanner";
import DrinksSection from "@/components/DrinksSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

import mmKfcBox from "@/assets/mm-kfc-box.jpeg";

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

      {/* Promo Marquee Banner - After Search */}
      <PromoMarquee />

      {/* Tacos Section */}
      <TacosSection searchQuery={searchQuery} />

      {/* Promo Banner - MM'KFC */}
      <PromoBanner
        image={mmKfcBox}
        title="Poulet Pané Croustillant"
        subtitle="MM'KFC - Un plaisir irrésistible à chaque bouchée!"
        buttonText="Nous Trouver"
        buttonHref="https://www.google.com/maps/search/?api=1&query=Magnambougou+Bamako+Mali"
      />

      {/* Drinks & Supplements Section */}
      <DrinksSection />

      {/* Trust Section - Before Footer */}
      <TrustSection />

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default Index;
