import { MapPin } from "lucide-react";

interface PromoBannerProps {
  image: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  reverse?: boolean;
}

const PromoBanner = ({ image, title, subtitle, buttonText, buttonHref, reverse = false }: PromoBannerProps) => {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[300px] md:h-[400px]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${reverse ? 'from-transparent to-foreground/70' : 'from-foreground/70 to-transparent'}`} />
        
        <div className={`absolute inset-0 flex items-center ${reverse ? 'justify-end' : 'justify-start'}`}>
          <div className={`container mx-auto px-4`}>
            <div className={`max-w-md ${reverse ? 'ml-auto text-right' : ''}`}>
              <h3 className="text-2xl md:text-4xl font-extrabold text-primary-foreground mb-3">
                {title}
              </h3>
              {subtitle && (
                <p className="text-primary-foreground/90 text-lg mb-4">
                  {subtitle}
                </p>
              )}
              {buttonText && buttonHref && (
                <a
                  href={buttonHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                >
                  <MapPin className="h-5 w-5" />
                  {buttonText}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
