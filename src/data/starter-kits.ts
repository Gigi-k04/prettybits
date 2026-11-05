import keychainImage from "@/assets/Keychain-StarterKIt.jpeg";
import BookmarkImage from "@/assets/Bookmark-StarterKit.jpeg";
import CementCoasterImage from "@/assets/CementCoaster-StarterKit.jpeg";
import TrinketTrayImage from "@/assets/TrinketTray-StarterKit.jpeg";
import siliconeCoasterImage from "@/assets/SiliconeCoaster-StarterKit.jpeg";



export interface StarterKit {
  id: string;
  name: string;
  price: number;
  image: string;
  imageAlt: string;
  description: string;
  contents: string[];
}

// Replace placeholder names, prices, images, descriptions and contents here.
export const starterKits: StarterKit[] = [
  {
    id: "starter-kit-1",
    name: "Keychains",
    price: 100,
    image: keychainImage,
    imageAlt: "Keychains — keychain image",
    description:
      "Create your own keychains to hang on your bags, car keys etc.",
    contents: [
      "Keychain moulds x2",
      "Resin and Hardener",
      "Powder pigments x2",
      "Mixing cups",
      "Mixing sticks",
      "Nitrile gloves",
      "Mask",
      "Instructions",
      "FREE glitter",
    ],
  },
  {
    id: "starter-kit-2",
    name: "Bookmark",
    price: 140,
    image: BookmarkImage,
    imageAlt: "Bookmark — bookmark image",
    description:
      "Create your own custom bookmark for your favourite reads.",
    contents: [
      "Bookmark mould x1",
      "Resin and Hardener",
      "Powder pigments x2",
      "Mixing cups",
      "Mixing sticks",
      "Nitrile gloves",
      "Mask",
      "Instructions",
      "FREE glitter",
    ],
  },
  {
    id: "starter-kit-3",
    name: "Cement Coaster",
    price: 140,
    image: CementCoasterImage,
    imageAlt: "Cement Coaster — cement coaster image",
    description:
      "Transform this blank canvas into a stunning coaster with your own unique resin design. It's a fun way to add a personal touch to your space.",
    contents: [
      "Cement hexagon coaster mould x1",
      "Resin and Hardener",
      "Powder pigments x2",
      "Mixing cups",
      "Mixing sticks",
      "Nitrile gloves",
      "Mask",
      "Instructions",
      "FREE glitter",
    ],
  },
  {
    id: "starter-kit-4",
    name: "Cement Trinket Tray",
    price: 190,
    image: TrinketTrayImage,
    imageAlt: "Cement Trinket Tray — trinket tray image",
    description:
      "Design a decorative trinket tray with your own unique resin touch. It's a blank canvas waiting for you.",
    contents: [
      "Cement trinket tray mould x1",
      "Resin and Hardener",
      "Powder pigments x2",
      "Mixing cups",
      "Mixing sticks",
      "Nitrile gloves",
      "Mask",
      "Instructions",
      "FREE glitter",
    ],
  },
  {
    id: "starter-kit-5",
    name: "Silicone Coaster",
    price: 190,
    image: siliconeCoasterImage,
    imageAlt: "Silicone Coaster — silicone coaster image",
    description:
      "Have fun creating your very own resin coaster! You can gift it to a friend or simply enjoy looking at it during your next coffee break.",
    contents: [
      "Silicone coaster mould x1",
      "Resin and Hardener",
      "Powder pigments x2",
      "Mixing cups",
      "Mixing sticks",
      "Nitrile gloves",
      "Mask",
      "Instructions",
      "FREE glitter",
    ],
  },
];

export const INCLUDED_COLOUR_COUNT = 2;
export const EXTRA_COLOUR_PRICE = 5;
export const starterKitColours = [
  { name: "Pink", hex: "#ed9fbd" },
  { name: "Purple", hex: "#9563b5" },
  { name: "Light blue", hex: "#488dce" },
  { name: "Dark blue", hex: "#00008B" },
  { name: "Light green", hex: "#88E788" },
  { name: "Dark green", hex: "#559866" },
  { name: "Teal", hex: "#008080" },
  { name: "Orange", hex: "#ffa500" },
  { name: "Yellow", hex: "#f3d453" },
  { name: "Red", hex: "#d94b54" },
  { name: "Gold", hex: "#c5a044" },
   { name: "White", hex: "#ffffff" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Black", hex: "#000000" },
];
