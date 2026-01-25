import { Phone, Clock, MapPin, MessageCircle } from "lucide-react";
import logo from "@/assets/mm-tacos-logo.png";

const Footer = () => {
  const googleMapsLink = "https://www.google.com/maps/dir//Magnambougou,+Bamako,+Mali";

  return (
    <footer id="contact" className="bg-foreground text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <img src={logo} alt="MM Tacos" className="h-16 w-auto mb-4" />
            <p className="opacity-80 text-sm">
              Goût unique ! Sauces sélectionnées et mélangées avec expertise. 
              Tortillas de maïs venu sans escale. 
              Viandes rigoureusement choisies pour le club MM TACOS.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <div className="space-y-3">
              <a
                href="tel:+22373360131"
                className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity"
              >
                <Phone className="h-5 w-5 text-primary" />
                <span>+223 73 36 01 31</span>
              </a>
              <a
                href="https://wa.me/22373360131"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity"
              >
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
                <span>WhatsApp</span>
              </a>
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity"
              >
                <MapPin className="h-5 w-5 text-primary" />
                <span>Magnambougou, Bamako</span>
              </a>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-bold text-lg mb-4">Horaires</h4>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Livraison disponible</p>
                <p className="opacity-80">De 9h à 4h du matin</p>
                <p className="opacity-80 text-sm mt-2">7 jours sur 7</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="opacity-60 text-sm">
            © {new Date().getFullYear()} MM Tacos. Tous droits réservés. Bamako, Mali
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
