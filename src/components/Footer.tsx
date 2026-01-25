import { Phone, Clock, MapPin, MessageCircle } from "lucide-react";
import logo from "@/assets/mm-tacos-logo-transparent.png";

// Social media icons as SVG components
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const Footer = () => {
  const googleMapsLink = "https://www.google.com/maps/place/MM+TACOS/@12.6206771,-7.9580008,17z/data=!3m1!4b1!4m6!3m5!1s0xe51d3001d42eed1:0xfd15ace43f739f37!8m2!3d12.6206771!4d-7.9554259!16s%2Fg%2F11yx7jnj7f?entry=ttu&g_ep=EgoyMDI2MDEyMS4wIKXMDSoASAFQAw%3D%3D";

  const socialLinks = [
    { name: "TikTok", url: "https://www.tiktok.com/@mm_tacos?_r=1&_t=ZS-93LcTglIWLS", icon: TikTokIcon },
    { name: "Instagram", url: "https://www.instagram.com/mm_tacos_?igsh=M3E2aHo0cWRubWVu", icon: InstagramIcon },
    { name: "Facebook", url: "https://www.facebook.com/people/MM-Tacos/100088074709971/?mibextid=wwXIfr&rdid=wMckVJWNQxUCmKVo&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F14Vy6iWPa4z%2F%3Fmibextid%3DwwXIfr%26ref%3D1", icon: FacebookIcon },
    { name: "YouTube", url: "https://www.youtube.com/@mmtacos-x8u", icon: YouTubeIcon },
  ];

  return (
    <footer id="contact" className="bg-foreground text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <img src={logo} alt="MM Tacos" className="h-20 w-auto mb-4" />
            <p className="opacity-80 text-sm">
              Goût unique ! Sauces sélectionnées et mélangées avec expertise. 
              Tortillas de maïs venu sans escale. 
              Viandes rigoureusement choisies pour le club MM TACOS.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-primary transition-colors"
                  aria-label={social.name}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <div className="space-y-3">
              <a
                href="tel:+22384437961"
                className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity"
              >
                <Phone className="h-5 w-5 text-primary" />
                <span>+223 84 43 79 61</span>
              </a>
              <a
                href="https://wa.me/22373360131"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity"
              >
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
                <span>WhatsApp: +223 73 36 01 31</span>
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
