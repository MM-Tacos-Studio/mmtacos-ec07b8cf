import { useState } from "react";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import PromoMarquee from "@/components/PromoMarquee";
import HeroSection from "@/components/HeroSection";
import TrustSection from "@/components/TrustSection";
import TacosSection from "@/components/TacosSection";
import FamilyMenuSection from "@/components/FamilyMenuSection";
import EnterpriseMenuSection from "@/components/EnterpriseMenuSection";
import PromoBanner from "@/components/PromoBanner";
import DrinksSection from "@/components/DrinksSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import DeliveryModeModal from "@/components/DeliveryModeModal";
import { useDeliveryMode } from "@/hooks/useDeliveryMode";

import promoBanner from "@/assets/promo-banner-1.jpg";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { deliveryMode, showModeModal, setDeliveryMode, handleViewMenu } = useDeliveryMode();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar with delivery mode indicator */}
      <TopBar 
        deliveryMode={deliveryMode} 
        onModeChange={setDeliveryMode}
        showInstallButton={true}
      />
      
      {/* Navbar */}
      <Navbar />

      {/* Hero Section with Search */}
      <HeroSection onSearch={setSearchQuery} />

      {/* Promo Marquee Banner - After Search */}
      <PromoMarquee />

      {/* Tacos Section - Individual */}
      <TacosSection searchQuery={searchQuery} />

      {/* Promo Banner - MM'KFC */}
      <PromoBanner
        image={promoBanner}
        title="Poulet Pané Croustillant"
        subtitle="MM'KFC - Un plaisir irrésistible à chaque bouchée!"
        buttonText="Nous Trouver"
        buttonHref="https://www.google.com/maps/place/MM+TACOS/@12.6206771,-7.9580008,17z/data=!3m1!4b1!4m6!3m5!1s0xe51d3001d42eed1:0xfd15ace43f739f37!8m2!3d12.6206771!4d-7.9554259!16s%2Fg%2F11yx7jnj7f?entry=ttu&g_ep=EgoyMDI2MDEyMS4wIKXMDSoASAFQAw%3D%3D"
      />

      {/* Family Menu Section */}
      <FamilyMenuSection />

      {/* Enterprise Menu Section */}
      <EnterpriseMenuSection />

      {/* Drinks Section - At the bottom before Trust/Footer */}
      <DrinksSection />

      {/* Trust Section - Before Footer */}
      <TrustSection />

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Delivery Mode Selection Modal */}
      <DeliveryModeModal
        isOpen={showModeModal}
        onSelect={setDeliveryMode}
        onViewMenu={handleViewMenu}
      />
    </div>
  );
};

export default Index;
