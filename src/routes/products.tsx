import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

import ringTrayImg1 from "@/assets/Rectangle Ring Tray 3.jpeg";
import ringTrayImg2 from "@/assets/Ring Tray 2 (2).jpeg";
import weddingFavoursImg1 from "@/assets/Wedding Favours 1.jpeg";
import weddingFavoursImg2 from "@/assets/Wedding Favours 2.1.jpeg";
import weddingFavoursImg3 from "@/assets/Wedding Favours 3.jpeg";

import flowersImg1 from "@/assets/Flower Hexagon 3.jpeg";
import flowersImg2 from "@/assets/Flower Rectangle Tray 3.jpeg";
import flowersImg3 from "@/assets/Flower Table 1.jpeg";
import customImg1 from "@/assets/Rock.jpeg";
import customImg2 from "@/assets/Africa.jpeg";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — PrettyBits Resin Art" },
      {
        name: "description",
        content:
          "Explore custom wedding ring trays, wedding favours, floral keepsakes, and bespoke handcrafted resin art at PrettyBits Cape Town.",
      },
      { property: "og:title", content: "Handcrafted Resin Creations — PrettyBits" },
      {
        property: "og:description",
        content: "Browse wedding keepsakes, ring trays, preserved flowers, and custom resin art.",
      },
      { property: "og:image", content: ringTrayImg1 },
    ],
  }),
  component: ProductsPage,
});

interface ProductItem {
  id: string;
  images: { src: string; alt: string }[];
  title: string;
  enquiryName: string;
  categoryTag: string;
  description: string;
  enquiryType: "Custom Commission" | "Product Question" | "Workshop Booking" | "Other";
}

const products: ProductItem[] = [
  {
    id: "ring-tray",
    images: [
      { src: ringTrayImg1, alt: "Rectangle Wedding Ring Tray" },
      { src: ringTrayImg2, alt: "Custom Gold Leaf Ring Tray Details" },
    ],
    title: "Wedding Ring Trays",
    enquiryName: "a Wedding Ring Tray",
    categoryTag: "Wedding Ring Tray",
    description:
      "Elegantly crafted resin ring trays tailored with delicate gold leafing, personalized lettering, or preserved petals to hold your rings on your big day.",
    enquiryType: "Custom Commission",
  },
  {
    id: "wedding-favours",
    images: [
      { src: weddingFavoursImg1, alt: "Resin Wedding Favours" },
      { src: weddingFavoursImg2, alt: "Handcrafted Favours in Studio" },
      { src: weddingFavoursImg3, alt: "Custom Resin Wedding Favours" },
    ],
    title: "Wedding Favours",
    enquiryName: "Wedding Favours",
    categoryTag: "Wedding Favours",
    description: "Heartfelt, custom-poured thank-you gifts for your guests.",
    enquiryType: "Custom Commission",
  },
  {
    id: "flower-preservation",
    images: [
      { src: flowersImg1, alt: "Bridal Bouquet Hexagon Block" },
      { src: flowersImg2, alt: "Preserved Floral Cube" },
      // { src: flowersImg3, alt: "Floral Tabletop Display" },
    ],
    title: "Flower Preservation & Keepsakes",
    enquiryName: "a Floral Keepsake",
    categoryTag: "Floral Keepsake",
    description:
      "Immortalise your bridal bouquet or special event blooms inside crystal-clear, archival resin blocks, arches, or resin hearts.",
    enquiryType: "Custom Commission",
  },
  {
    id: "custom-pieces",
    images: [
      { src: customImg1, alt: "Custom Resin Rock" },
      { src: customImg2, alt: "Custom Resin Africa" },
    ],
    title: "Custom Commissions",
    enquiryName: "a Custom Piece",
    categoryTag: "Custom Art",
    description:
      "Have a unique vision? We collaborate directly with you to craft geode wall art, vanity trays, memory blocks, and custom color sets.",
    enquiryType: "Custom Commission",
  },
];

function ProductCard({ product }: { product: ProductItem }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const prevImage = () => {
    setCurrentImgIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImgIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-soft hover:shadow-lg transition-all duration-300">
      {/* Image Carousel Header */}
      <div className="relative aspect-4/3 overflow-hidden bg-secondary">
        <img
          src={product.images[currentImgIndex].src}
          alt={product.images[currentImgIndex].alt}
          loading="lazy"
          className="h-full w-full object-cover transition-all duration-500"
        />

        <span className="absolute top-4 left-4 rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-xs font-medium text-foreground shadow-xs">
          {product.categoryTag}
        </span>

        {/* Carousel Navigation Buttons (Visible if > 1 Image) */}
        {product.images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs opacity-90 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs opacity-90 transition-opacity"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Pagination Indicator Dots */}
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImgIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImgIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <h3 className="font-display text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Direct Link to Contact with pre-filled state */}
        <div className="mt-6 pt-4 border-t border-border/60">
          <Link
            to="/contact"
            search={{ enquiry: product.enquiryType, product: product.enquiryName }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group/link"
          >
            Enquire about this piece
            <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductsPage() {
  return (
    <>
      {/* Hero Section with Creative Wording */}
      <section className="bg-gradient-hero border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-24 text-center">
          <div>
            <p className="font-script text-7xl text-primary">Made To Be Yours</p>
            <h1 className="mx-auto mt-3 font-display text-5xl lg:text-6xl font-semibold text-balance max-w-3xl">
              Custom Resin Creations
            </h1>
            <p className="mx-auto mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              From elegant wedding pieces and preserved flowers to statement art and wonderfully
              unexpected keepsakes, we turn your ideas into one-of-a-kind pieces — no matter how
              sentimental, simple, or strange.
            </p>

            <div className="mt-8">
              <Link
                to="/contact"
                search={{ enquiry: "Custom Commission" }}
                className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 font-display font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Start a Custom Enquiry
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
