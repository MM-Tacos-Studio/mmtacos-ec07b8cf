// Centralized product catalog for POS
import tacosViande from "@/assets/tacos-viande-new.jpeg";
import tacosPoulet from "@/assets/tacos-poulet.jpeg";
import tacosMix from "@/assets/tacos-mix.jpeg";
import tacosKfc from "@/assets/tacos-kfc.jpeg";
import tacosCordonBleu from "@/assets/tacos-cordon-bleu.jpeg";
import tacosHotdog from "@/assets/tacos-hotdog-new.jpeg";
import tacosMerguez from "@/assets/tacos-merguez.jpeg";
import tacosCrevettes from "@/assets/tacos-crevettes-2.jpeg";
import tacosSaumon from "@/assets/tacos-saumon-2.jpeg";
import tacosCorNedBeef from "@/assets/tacos-corned-beef.jpeg";
import tacosPaneMiel from "@/assets/tacos-pane-miel.jpeg";
import kfcBox from "@/assets/mm-kfc-box.jpeg";
import supplementFromage from "@/assets/supplement-fromage.png";
import supplementFrites from "@/assets/supplement-frites.png";
import supplementAnanas from "@/assets/supplement-ananas.png";
import supplementOlives from "@/assets/supplement-olives.png";
import supplementGratine from "@/assets/supplement-gratine.png";
import supplementJambon from "@/assets/supplement-jambon.png";
import supplementOeufs from "@/assets/supplement-oeufs.png";
import supplementHotdog from "@/assets/supplement-hotdog.png";
import drinkGeneric from "@/assets/drink-generic.png";
import drinkMentheLait from "@/assets/drink-menthe-lait.png";

import tacosPouletMenu from "@/assets/tacos-poulet-menu.jpeg";

export interface PosProductSize {
  name: string; // M, XL, XXL
  price: number;
}

export interface PosProduct {
  id: string;
  name: string;
  price: number; // base price (M)
  image: string;
  category: "tacos" | "menu" | "supplement" | "boisson" | "special";
  sizes?: PosProductSize[];
}

export const posProducts: PosProduct[] = [
  // Tacos (with sizes)
  { id: "tacos-viande", name: "Tacos Viande", price: 4000, image: tacosViande, category: "tacos",
    sizes: [{ name: "M", price: 4000 }, { name: "XL", price: 6500 }, { name: "XXL", price: 10000 }] },
  { id: "tacos-poulet", name: "Tacos Poulet", price: 4000, image: tacosPoulet, category: "tacos",
    sizes: [{ name: "M", price: 4000 }, { name: "XL", price: 6500 }, { name: "XXL", price: 10000 }] },
  { id: "tacos-mixte", name: "Tacos Mixte", price: 4000, image: tacosMix, category: "tacos",
    sizes: [{ name: "M", price: 4000 }, { name: "XL", price: 6500 }, { name: "XXL", price: 10000 }] },
  { id: "tacos-kfc", name: "Tacos KFC", price: 5000, image: tacosKfc, category: "tacos",
    sizes: [{ name: "M", price: 5000 }, { name: "XL", price: 8000 }, { name: "XXL", price: 12000 }] },
  { id: "tacos-pane-miel", name: "Tacos Pané Miel", price: 5500, image: tacosPaneMiel, category: "tacos",
    sizes: [{ name: "M", price: 5500 }, { name: "XL", price: 8000 }, { name: "XXL", price: 12000 }] },
  { id: "tacos-cordon-bleu", name: "Tacos Cordon Bleu", price: 5000, image: tacosCordonBleu, category: "tacos",
    sizes: [{ name: "M", price: 5000 }, { name: "XL", price: 6500 }, { name: "XXL", price: 12000 }] },
  { id: "tacos-hotdog", name: "Tacos Hotdog", price: 4000, image: tacosHotdog, category: "tacos",
    sizes: [{ name: "M", price: 4000 }, { name: "XL", price: 6500 }, { name: "XXL", price: 10000 }] },
  { id: "tacos-merguez", name: "Tacos Merguez", price: 4000, image: tacosMerguez, category: "tacos",
    sizes: [{ name: "M", price: 4000 }, { name: "XL", price: 6500 }, { name: "XXL", price: 10000 }] },
  { id: "tacos-crevettes", name: "Tacos Crevettes", price: 7500, image: tacosCrevettes, category: "tacos",
    sizes: [{ name: "M", price: 7500 }, { name: "XL", price: 12500 }, { name: "XXL", price: 18500 }] },
  { id: "tacos-saumon", name: "Tacos Saumon", price: 6000, image: tacosSaumon, category: "tacos",
    sizes: [{ name: "M", price: 6000 }, { name: "XL", price: 8000 }, { name: "XXL", price: 12000 }] },
  { id: "tacos-corned-beef", name: "Tacos Corned-Beef", price: 4000, image: tacosCorNedBeef, category: "tacos",
    sizes: [{ name: "M", price: 4000 }, { name: "XL", price: 6500 }, { name: "XXL", price: 10000 }] },

  // Menus (tacos + frites + boisson)
  { id: "menu-viande", name: "MENU Tacos Viande", price: 5000, image: tacosViande, category: "menu",
    sizes: [{ name: "M", price: 5000 }, { name: "XL", price: 7500 }, { name: "XXL", price: 11000 }] },
  { id: "menu-poulet", name: "MENU Tacos Poulet", price: 5000, image: tacosPouletMenu, category: "menu",
    sizes: [{ name: "M", price: 5000 }, { name: "XL", price: 7500 }, { name: "XXL", price: 11000 }] },
  { id: "menu-mixte", name: "MENU Tacos Mixte", price: 5000, image: tacosMix, category: "menu",
    sizes: [{ name: "M", price: 5000 }, { name: "XL", price: 7500 }, { name: "XXL", price: 11000 }] },
  { id: "menu-kfc", name: "MENU Tacos KFC", price: 6000, image: tacosKfc, category: "menu",
    sizes: [{ name: "M", price: 6000 }, { name: "XL", price: 9000 }, { name: "XXL", price: 13000 }] },
  { id: "menu-cordon-bleu", name: "MENU Tacos Cordon Bleu", price: 6000, image: tacosCordonBleu, category: "menu",
    sizes: [{ name: "M", price: 6000 }, { name: "XL", price: 9000 }, { name: "XXL", price: 13000 }] },
  { id: "menu-hotdog", name: "MENU Tacos Hotdog", price: 5000, image: tacosHotdog, category: "menu",
    sizes: [{ name: "M", price: 5000 }, { name: "XL", price: 7500 }, { name: "XXL", price: 11000 }] },
  { id: "menu-merguez", name: "MENU Tacos Merguez", price: 5000, image: tacosMerguez, category: "menu",
    sizes: [{ name: "M", price: 5000 }, { name: "XL", price: 7500 }, { name: "XXL", price: 11000 }] },
  { id: "menu-crevettes", name: "MENU Tacos Crevettes", price: 8500, image: tacosCrevettes, category: "menu",
    sizes: [{ name: "M", price: 8500 }, { name: "XL", price: 13500 }, { name: "XXL", price: 19500 }] },
  { id: "menu-corned-beef", name: "MENU Tacos Corned-Beef", price: 5000, image: tacosCorNedBeef, category: "menu",
    sizes: [{ name: "M", price: 5000 }, { name: "XL", price: 7500 }, { name: "XXL", price: 11000 }] },

  // Special
  { id: "kfc-box", name: "MM'KFC Box", price: 5000, image: kfcBox, category: "special" },

  // Supplements
  { id: "sup-fromage", name: "Supplément Fromage", price: 500, image: supplementFromage, category: "supplement" },
  { id: "sup-frites", name: "Supplément Frites", price: 500, image: supplementFrites, category: "supplement" },
  { id: "sup-ananas", name: "Supplément Ananas", price: 500, image: supplementAnanas, category: "supplement" },
  { id: "sup-olives", name: "Supplément Olives", price: 500, image: supplementOlives, category: "supplement" },
  { id: "sup-gratine", name: "Gratiné", price: 1000, image: supplementGratine, category: "supplement" },
  { id: "sup-jambon", name: "Supplément Jambon", price: 500, image: supplementJambon, category: "supplement" },
  { id: "sup-oeufs", name: "Supplément Oeufs", price: 500, image: supplementOeufs, category: "supplement" },
  { id: "sup-hotdog", name: "Supplément Hotdog", price: 1000, image: supplementHotdog, category: "supplement" },

  // Boissons
  { id: "boisson", name: "Boisson", price: 500, image: drinkGeneric, category: "boisson" },
  { id: "menthe-lait", name: "Menthe au Lait", price: 1000, image: drinkMentheLait, category: "boisson" },

  // Spécial
  { id: "pane-miel", name: "Pané miel", price: 1500, image: tacosPaneMiel, category: "special" },
];
