const PromoMarquee = () => {
  const promos = [
    "🔥 -1000 FCFA sur ta première commande (2 tacos minimum)",
    "🎁 2 Boissons offertes sur commande de plus de 15000 FCFA",
    "📦 Gardez 20 emballages et bénéficiez d'un Tacos gratuit!",
  ];

  return (
    <div className="bg-primary text-primary-foreground py-3 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap">
        {promos.map((promo, index) => (
          <span key={index} className="mx-8 inline-block font-bold text-sm md:text-base">
            {promo}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {promos.map((promo, index) => (
          <span key={`dup-${index}`} className="mx-8 inline-block font-bold text-sm md:text-base">
            {promo}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PromoMarquee;
