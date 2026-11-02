import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Modal } from "@/components/Modal";
import { StarterKitRequestForm } from "@/components/StarterKitRequestForm";
import { EXTRA_COLOUR_PRICE, starterKits, type StarterKit } from "@/data/starter-kits";

export const Route = createFileRoute("/starter-kit")({
  head: () => ({
    meta: [
      { title: "Resin Starter Kits — PrettyBits" },
      {
        name: "description",
        content:
          "Explore PrettyBits resin starter kits. Choose two included colours and request your kit through WhatsApp.",
      },
    ],
  }),
  component: StarterKitPage,
});

function StarterKitPage() {
  const [selectedKit, setSelectedKit] = useState<StarterKit | null>(null);
  const [requesting, setRequesting] = useState(false);
  const close = () => {
    setSelectedKit(null);
    setRequesting(false);
  };
  return (
    <>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 lg:py-20 text-center">
          <p className="font-script text-7xl text-primary">Make at home</p>
          <h1 className="mt-3 font-display text-5xl lg:text-6xl font-semibold">
            Find your starter kit.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            A little inspiration for your next resin project. Our kits include everything you need for your at home resin project.
            
          </p>

          

          <button
            type="button"
            onClick={() => {
              setSelectedKit(null);
              setRequesting(true);
            }}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-teal text-primary-foreground px-6 py-3.5 text-sm font-medium shadow-soft hover:shadow-elevated transition-all focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
          >
            Order a starter kit
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        
          <h2 className="mt-1 font-display text-3xl font-semibold">Pick your project</h2>
          <p className="mt-3 text-sm text-muted-foreground">All our starter-kits are beginnner friendly.</p>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm">
          <AlertCircle className="h-5 w-5 text-accent-foreground/80 shrink-0 mt-0.5" />
          <p className="text-foreground/80">
            <strong className="font-semibold">Please note:</strong> Resin can be
            harmful to pregnant women. Not suitable for kids under 13 years without adult supervision.
          </p>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {starterKits.map((kit) => (
            <button
              key={kit.id}
              type="button"
              onClick={() => {
                setSelectedKit(kit);
                setRequesting(false);
              }}
              className="rounded-2xl border border-border overflow-hidden bg-background shadow-soft flex flex-col text-left hover:shadow-elevated transition-shadow focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
              aria-label={`View details for ${kit.name}`}
            >
              <img
                src={kit.image}
                alt={kit.imageAlt}
                loading="lazy"
                className="aspect-square w-full object-cover bg-secondary/60"
              />
              <div className="p-4 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-medium text-sm leading-snug">{kit.name}</h2>
                  <span className="font-display text-base font-semibold text-primary">
                    R{kit.price}
                  </span>
                </div>
                <span className="group/details mt-3 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors">
                  View details <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover/details:translate-x-1" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
      <Modal
        open={requesting || selectedKit !== null}
        onClose={close}
        title={
          requesting ? "Request starter kits" : (selectedKit?.name ?? "Starter kit details")
        }
      >
        {requesting ? (
            <StarterKitRequestForm
              key={selectedKit?.id ?? "new-request"}
              kit={selectedKit ?? undefined}
              onBack={selectedKit ? () => setRequesting(false) : undefined}
            />
          ) : selectedKit ? (
            <div className="space-y-5">
              <img
                src={selectedKit.image}
                alt={selectedKit.imageAlt}
                className="w-full aspect-square object-cover rounded-xl"
              />
              <p className="font-display text-2xl font-semibold text-primary">
                R{selectedKit.price}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedKit.description}
              </p>
              <div>
                <h3 className="font-display text-lg font-semibold">What's included</h3>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {selectedKit.contents.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="text-sm">
                Add extra colours for R{EXTRA_COLOUR_PRICE} each when
                you request your kit.
              </p>
              <button
                type="button"
                onClick={() => setRequesting(true)}
                className="w-full rounded-full bg-gradient-teal text-primary-foreground px-6 py-3.5 text-sm font-medium shadow-soft hover:shadow-elevated transition-all"
              >
                Request this starter kit
              </button>
            </div>
          ) : null}
      </Modal>
    </>
  );
}
