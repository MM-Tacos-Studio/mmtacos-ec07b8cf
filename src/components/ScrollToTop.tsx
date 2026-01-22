import { ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-3 rounded-full
        shadow-[0_4px_0_0_hsl(var(--primary)/0.7)] 
        hover:shadow-[0_6px_0_0_hsl(var(--primary)/0.7)] hover:-translate-y-0.5
        active:shadow-[0_1px_0_0_hsl(var(--primary)/0.7)] active:translate-y-1
        transition-all duration-100 ease-out
        ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"}`}
      aria-label="Remonter en haut"
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  );
};

export default ScrollToTop;
