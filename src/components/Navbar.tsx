import { useState } from "react";
import { Menu, X, MapPin } from "lucide-react";
import logo from "@/assets/mm-tacos-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Nos Tacos", href: "#tacos" },
    { name: "Menu Familial", href: "#menu-familial" },
    { name: "Menu Entreprise", href: "#menu-entreprise" },
    { name: "Boissons", href: "#boissons" },
    { name: "Contact", href: "#contact" },
  ];

  const googleMapsLink = "https://www.google.com/maps/place/MM+TACOS/@12.6206771,-7.9580008,17z/data=!3m1!4b1!4m6!3m5!1s0xe51d3001d42eed1:0xfd15ace43f739f37!8m2!3d12.6206771!4d-7.9554259!16s%2Fg%2F11yx7jnj7f?entry=ttu&g_ep=EgoyMDI2MDEyMS4wIKXMDSoASAFQAw%3D%3D";

  return (
    <nav className="bg-card sticky top-0 z-50 shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#accueil" className="flex items-center gap-2">
            <img src={logo} alt="MM Tacos" className="h-12 w-auto" />
            <span className="font-extrabold text-xl tracking-tight" style={{ fontFamily: "'Arial Black', sans-serif" }}>
              <span className="text-primary">MM</span><span className="text-foreground">TACOS</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-foreground font-medium hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
            <a
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <MapPin className="h-4 w-4" />
              Itinéraire
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-foreground font-medium hover:text-primary transition-colors py-2"
                >
                  {link.name}
                </a>
              ))}
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium"
              >
                <MapPin className="h-4 w-4" />
                Itinéraire vers Magnambougou
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
