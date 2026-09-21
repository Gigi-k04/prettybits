import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Clock,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Image as ImageIcon,
} from "lucide-react";
import workshopImg from "@/assets/workshopHero.jpeg";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { Modal } from "@/components/Modal";
import { BookingForm, type WorkshopDate } from "@/components/BookingForm";

import coasterbmimage from "@/assets/coaster and bookmark1.jpeg";
import ttandcoasterimage from "@/assets/finished workshop coasters.jpeg";
import roundcimage from "@/assets/round coasters1.jpeg";
import resinoncimage from "@/assets/Resin on Canvas1.jpeg";
import cheeseboardimage from "@/assets/Finished Cheeseboards.jpeg";
import resintableimage from "@/assets/Resin Table1.jpeg";
import cakestandimage from "@/assets/finished Cake stand.jpeg";
import trayimage from "@/assets/Tray.jpeg";
import rivetableimage1 from "@/assets/River Table 1.1.jpeg";
import rivetableimage2 from "@/assets/River Table7.jpeg";
import rivetableimage3 from "@/assets/River Table 6.jpeg";
import sideTableimage from "@/assets/SideTable40.jpeg";

export const Route = createFileRoute("/workshops")({
  head: () => ({
    meta: [
      { title: "Resin Workshops — PrettyBits Cape Town" },
      {
        name: "description",
        content:
          "Beginner-friendly resin art workshops in Cape Town. Coasters, cheeseboards, river tables and private sessions.",
      },
      { property: "og:title", content: "Resin Workshops — PrettyBits" },
      {
        property: "og:description",
        content: "Hands-on, beginner-friendly resin workshops. All materials provided.",
      },
      { property: "og:image", content: workshopImg },
    ],
  }),
  component: WorkshopsPage,
});

const WHATSAPP_NUMBER = "27834411311";

const waLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const standardWorkshops = [
  { name: "Coaster & Bookmark", price: 290, image: coasterbmimage },
  { name: "Trinket Tray & Coaster (Cement)", price: 390, image: ttandcoasterimage },
  { name: "Resin Coasters ×2", price: 490, image: roundcimage },
  { name: "Resin on Canvas", price: 590, image: resinoncimage },
  { name: "Cheeseboard", price: 690, image: cheeseboardimage },
  { name: "Side Table 30cm", price: 690, image: resintableimage },
  { name: "Tray", price: 790, image: trayimage },
  { name: "Cake Stand", price: 790, image: cakestandimage },
  { name: "Side Table 40cm", price: 790, image: sideTableimage },
];

const riverTableWorkshops = [
  { name: "Serving Board 600 × 400mm", price: 3490, image: rivetableimage1 },
  { name: "Serving Board 400 × 300mm", price: 2290, image: rivetableimage2 },
  { name: "Round Side Table 400mm diameter", price: 2290, image: rivetableimage3 },
];

const standardDates: WorkshopDate[] = [
  
  { date: "Saturday, 5 September", time: "11:00 AM", full: false },
  
  { date: "Sunday, 13 September", time: "2:00 PM", full: false },
  { date: "Saturday, 26 September", time: "2:00 PM", full: false },
  { date: "Sunday, 27 September", time: "11:00 AM", full: false },
  { date: "Sunday, 11 October", time: "2:00 PM", full: false },
  { date: "Saturday, 24 October", time: "2:00 PM", full: false },
  { date: "Sunday, 25 October", time: "11:00 AM", full: false },
  { date: "Saturday, 31 October", time: "11:00 AM", full: false },
  { date: "Saturday, 7 November", time: "11:00 AM", full: false },
  { date: "Sunday, 15 November", time: "2:00 PM", full: false },
  { date: "Saturday, 28 November", time: "2:00 PM", full: false },
  { date: "Sunday, 29 November", time: "11:00 AM", full: false },
  { date: "Saturday, 5 December", time: "11:00 AM", full: false },
  { date: "Saturday, 19 December", time: "2:00 PM", full: false },
  { date: "Sunday, 20 December", time: "11:00 AM", full: false },
  { date: "Sunday, 27 December", time: "2:00 PM", full: false },
];

const riverTableDates: WorkshopDate[] = [
  { date: "Sunday, 8 November", time: "2:00 PM", full: false },
];

function WorkshopOptionCard({
  name,
  price,
  image,
}: {
  name: string;
  price: number;
  image: string | null;
}) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-background shadow-soft flex flex-col">
      <div className="relative aspect-square bg-secondary/60">
        {image ? (
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-sm leading-snug">{name}</span>
        <span className="font-display text-base font-semibold text-primary whitespace-nowrap">
          R{price}pp
        </span>
      </div>
    </div>
  );
}

function getUpcomingWorkshopDates(dates: WorkshopDate[]): WorkshopDate[] {
  const now = new Date();
  const year = 2026;

  return dates.filter((workshop) => {
    const datePart = workshop.date
      .replace(
        /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s*/,
        ""
      );

    const workshopDate = new Date(`${datePart} ${year}`);

    // Keep the date if it hasn't passed yet.
    return workshopDate >= now;
  });
}

const upcomingRiverTableDates = getUpcomingWorkshopDates(riverTableDates);

function WorkshopsPage() {
  const [bookingModal, setBookingModal] = useState<"standard" | "river" | null>(
    null
  );
  const [showAllDates, setShowAllDates] = useState(false);

  const DATES_PREVIEW_COUNT = 8;

  const upcomingStandardDates = getUpcomingWorkshopDates(standardDates);

  const visibleDates = showAllDates
    ? upcomingStandardDates
    : upcomingStandardDates.slice(0, DATES_PREVIEW_COUNT);
    
  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <p className="font-script text-7xl text-primary">Workshops</p>
            <h1 className="mt-3 font-display text-5xl lg:text-6xl font-semibold text-balance">
              Learn the art of resin in a fun, creative space.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              Beginner friendly, no prior experience needed. All materials are
              provided, just bring yourself and your creative energy. Workshops
              run on weekends in Goodwood, Cape Town.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button
                type="button"
                onClick={() => setBookingModal("standard")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-teal text-primary-foreground px-6 py-3.5 text-sm font-medium shadow-soft hover:shadow-elevated transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                Book a workshop
              </button>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-elevated aspect-4/3 lg:aspect-square">
            <img
              src={workshopImg}
              alt="Resin being poured during a PrettyBits workshop"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              Icon: Clock,
              title: "About 2 hours",
              text: "Most weekend workshops run for around two hours from start to finish.",
            },
            {
              Icon: Check,
              title: "All materials included",
              text: "Resin, pigments, moulds and protective equipment — all provided.",
            },
            {
              Icon: Users,
              title: "Beginner friendly",
              text: "No experience required — small, supportive groups with one-on-one guidance.",
            },
          ].map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border p-8 bg-background">
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm">
          <AlertCircle className="h-5 w-5 text-accent-foreground/80 shrink-0 mt-0.5" />
          <p className="text-foreground/80">
            <strong className="font-semibold">Please note:</strong> Cured items
            can be collected 1–2 weeks after your workshop date. Resin can be
            harmful to pregnant women. Not suitable for kids under 13 years without adult supervision.
          </p>
        </div>
      </section>

      {/* UPCOMING DATES */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-20">
        <p className="font-script text-6xl text-primary">When</p>
        <h2 className="mt-1 font-display text-3xl font-semibold">Upcoming workshop dates</h2>

        {upcomingStandardDates.length > 0 ? (
          <>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {visibleDates.map((d, i) => (
                <div
                  key={`${d.date}-${d.time ?? ""}-${i}`}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                    d.full
                      ? "border-border bg-secondary/40 text-muted-foreground line-through opacity-70"
                      : "border-border bg-background"
                  }`}
                >
                  <span className="font-medium">
                    {d.date}
                    {d.time ? `, ${d.time}` : ""}
                  </span>
                  {d.note && !d.full && (
                    <span className="text-muted-foreground">· {d.note}</span>
                  )}
                  {d.full && (
                    <span className="text-xs font-medium text-red-600 no-underline">
                      Full
                    </span>
                  )}
                </div>
              ))}
            </div>

            {upcomingStandardDates.length > DATES_PREVIEW_COUNT && (
              <button
                type="button"
                onClick={() => setShowAllDates((v) => !v)}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {showAllDates
                  ? "Show fewer dates"
                  : `Show all ${upcomingStandardDates.length} dates`}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showAllDates ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-border p-8 bg-secondary/40 text-center">
            <p className="text-muted-foreground">
              New dates are added regularly — message us on WhatsApp for the
              current schedule and availability.
            </p>
            <a
              href={waLink("Hi! Could you tell me about upcoming workshop dates?")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-teal text-primary-foreground px-6 py-3 text-sm font-medium shadow-soft hover:shadow-elevated transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              Ask about dates
            </a>
          </div>
        )}
      </section>

      {/* WORKSHOP OPTIONS SECTION */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-24 space-y-12">
        {/* 1. REGULAR WORKSHOPS */}
        <div id="regular-workshops">
          <p className="font-script text-6xl text-primary">Workshop options</p>
          <h2 className="mt-1 font-display text-3xl font-semibold">Pick your project</h2>
          <p className="mt-3 text-sm text-muted-foreground">Per person, all materials included.</p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {standardWorkshops.map((w) => (
              <WorkshopOptionCard key={w.name} {...w} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setBookingModal("standard")}
            className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-teal text-primary-foreground px-6 py-3.5 text-sm font-medium shadow-soft hover:shadow-elevated transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            Book a workshop
          </button>
        </div>

        {/* 2. RIVER TABLES (PREMIUM) */}
        <div id="river-table-workshops" className="rounded-3xl bg-gradient-teal text-primary-foreground p-8 lg:p-12 relative overflow-hidden shadow-soft">
          <div className="absolute inset-0 bg-gradient-shine opacity-40" />
          <div className="relative">
            <p className="font-script text-6xl text-accent">Premium</p>
            <h2 className="mt-1 font-display text-3xl font-semibold">River table workshops</h2>
            <p className="mt-3 text-sm text-primary-foreground/80 max-w-2xl">
              Made with wild olive.
            </p>

            <div className="mt-8 grid sm:grid-cols-3 gap-4 max-w-4xl">
              {riverTableWorkshops.map((w) => (
                <div
                  key={w.name}
                  className="rounded-2xl bg-primary-foreground/10 backdrop-blur overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-4/5 bg-primary-foreground/10">
                    {w.image ? (
                      <img
                        src={w.image}
                        alt={w.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-primary-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-sm">{w.name}</p>
                    <p className="mt-1 font-display font-semibold">R{w.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {riverTableDates.length > 0 && (
              <div className="mt-8 max-w-4xl">
                <p className="text-sm font-medium text-primary-foreground/85 mb-3">
                  Upcoming river table dates
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {riverTableDates.map((d) => (
                    <div
                      key={d.date}
                      className={`rounded-xl bg-primary-foreground/10 backdrop-blur p-4 ${
                        d.full ? "opacity-60" : ""
                      }`}
                    >
                      <p className="text-sm font-semibold">{d.date}</p>
                      {d.note && (
                        <p className="mt-0.5 text-xs text-primary-foreground/70">{d.note}</p>
                      )}
                      {d.full && (
                        <span className="mt-1 inline-block text-xs font-medium text-accent">
                          Fully booked
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setBookingModal("river")}
              className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-background text-primary px-8 py-3.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Book a river table
            </button>
          </div>
        </div>

        {/* 3. PRIVATE, CORPORATE & OFFSITE */}
        <div id="private-workshops" className="rounded-3xl border border-border p-8 lg:p-12 flex flex-col md:flex-row gap-8 items-center bg-background shadow-soft justify-between">
          <div className="space-y-3 max-w-2xl">
            <p className="font-script text-6xl text-primary">Private, corporate & offsite</p>
            <h3 className="font-display text-3xl font-semibold">
              Team buildings & private workshops
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Birthdays, team-building events or just a fun day
              with friends. Hosted in Goodwood, at your venue, or
              anywhere in Cape Town — choose from trinket trays, coasters,
              cheeseboards, side tables and more.
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• Private sessions — just for you and your group</li>
              <li>• Corporate events — team-building with a take-home piece</li>
              <li>• Offsite — we bring the workshop to your venue</li>
            </ul>
          </div>
          <div className="flex shrink-0 w-full md:w-auto">
            <a
              href={waLink(
                "Hi! I'd like to enquire about a private/corporate/offsite resin workshop."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-full border border-primary text-primary px-8 py-3.5 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Plan a private session
            </a>
          </div>
        </div>
      </section>

      {/* BOOKING MODALS */}
      <Modal
        open={bookingModal === "standard"}
        onClose={() => setBookingModal(null)}
        title="Book a workshop"
      >
       <BookingForm
        workshopOptions={standardWorkshops}
        availableDates={upcomingStandardDates}
        onClose={() => setBookingModal(null)}
      />
      </Modal>

      <Modal
        open={bookingModal === "river"}
        onClose={() => setBookingModal(null)}
        title="Book a river table workshop"
      >
        <BookingForm
          workshopOptions={riverTableWorkshops}
          availableDates={upcomingRiverTableDates}
          onClose={() => setBookingModal(null)}
        />
      </Modal>
    </>
  );
}