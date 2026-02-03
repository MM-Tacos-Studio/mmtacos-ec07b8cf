import { useEffect, useState } from "react";

const OpenStatus = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkIfOpen = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Horaires d'ouverture : 11h - 23h tous les jours
      // Ajustez selon vos horaires réels
      const openingHour = 11;
      const closingHour = 23;
      
      // Ouvert tous les jours de 11h à 23h
      const isWithinHours = hour >= openingHour && hour < closingHour;
      setIsOpen(isWithinHours);
    };

    checkIfOpen();
    // Vérifier toutes les minutes
    const interval = setInterval(checkIfOpen, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        {/* Dot indicator */}
        <span 
          className={`relative flex h-3 w-3 ${isOpen ? '' : ''}`}
        >
          {isOpen && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          )}
          <span 
            className={`relative inline-flex rounded-full h-3 w-3 ${
              isOpen ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></span>
        </span>
      </div>
      <span 
        className={`text-xs font-bold uppercase tracking-wide ${
          isOpen ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {isOpen ? 'Ouvert' : 'Fermé'}
      </span>
    </div>
  );
};

export default OpenStatus;
