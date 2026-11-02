import { useState, useEffect } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Instagram, MessageCircle } from "lucide-react";


export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): { enquiry?: string; product?: string } => ({
    enquiry: typeof search.enquiry === "string" ? search.enquiry : undefined,
    product: typeof search.product === "string" ? search.product : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contact — PrettyBits Cape Town" },
      { name: "description", content: "Get in touch with PrettyBits for custom resin art commissions, workshop bookings and enquiries." },
      { property: "og:title", content: "Contact PrettyBits" },
      { property: "og:description", content: "Get in touch for custom commissions and workshop bookings." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const search = useSearch({ from: "/contact" }) as { enquiry?: string; product?: string };

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contactMethod, setContactMethod] = useState<"email" | "whatsapp">("email");

  // Single declaration initialized directly from search parameters
  const [fields, setFields] = useState({
    name: "",
    email: "",
    phone: "",
    enquiry_type: search?.enquiry || "",
    message: search?.product
      ? `Hi! I would like to enquire about ordering ${search.product}.`
      : "",
  });

  // Optional: Sync search parameters if the user navigates while staying on the page
  useEffect(() => {
    if (search?.enquiry || search?.product) {
      setFields((prev) => ({
        ...prev,
        enquiry_type: search?.enquiry || prev.enquiry_type,
        message: search?.product
          ? `Hi! I would like to enquire about ordering ${search.product}.`
          : prev.message,
      }));
    }
  }, [search?.enquiry, search?.product]);
  

  function validate() {
    const e: Record<string, string> = {};
    if (!fields.name.trim()) e.name = "Please enter your name.";
    
    // Email is only strictly required if sending via email
    if (contactMethod === "email") {
      if (!fields.email.trim()) e.email = "Please enter your email address.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = "Please enter a valid email address.";
    } else if (fields.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      e.email = "Please enter a valid email address.";
    }

    if (!fields.phone.trim()) e.phone = "Please enter your phone number.";
    if (!fields.enquiry_type) e.enquiry_type = "Please select an enquiry type.";
    if (!fields.message.trim()) e.message = "Please enter a message.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    // Direct to WhatsApp
    if (contactMethod === "whatsapp") {
      const whatsappNumber = "27834411311";
      const text = `Hi PrettyBits! 👋\n\n*Name:* ${fields.name}\n*Phone:* ${fields.phone}\n*Email:* ${fields.email || "N/A"}\n*Enquiry Type:* ${fields.enquiry_type}\n\n*Message:*\n${fields.message}`;
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      
      setStatus("success");
      setFields({ name: "", email: "", phone: "", enquiry_type: "", message: "" });
      return;
    }

    // Direct to Email via Web3Forms
    setStatus("loading");
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        setStatus("success");
        setFields({ name: "", email: "", phone: "", enquiry_type: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-24 text-center">
          <p className="font-script text-7xl text-primary">Get in touch</p>
          <h1 className="mt-3 font-display text-5xl lg:text-6xl font-semibold text-balance">
            We'd love to hear from you.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Custom orders, workshop questions, or any other enquiries - please contact us below.
          </p>
        </div>
      </section>

      {/* Enquiry Form */}
      <section className="mx-auto max-w-5xl px-6 lg:px-10 py-20">
        <div className="rounded-2xl border border-border bg-background p-8 lg:p-10">

          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="font-display text-3xl font-semibold">Thank you!</h2>
              <p className="text-muted-foreground max-w-sm">
                Your message has been sent. We'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 rounded-xl border border-border px-6 py-3 text-sm font-medium hover:border-primary transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl font-semibold">Send us a message</h2>
              <p className="mt-2 text-muted-foreground">
                Fill in the form and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
                <input type="hidden" name="access_key" value={import.meta.env.VITE_WEB3FORMS_KEY} />
                <input type="hidden" name="subject" value="New enquiry from PrettyBits website" />
                <input type="checkbox" name="botcheck" className="hidden" />

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={fields.name}
                      onChange={e => setFields(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      className={`rounded-xl border px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary bg-background ${errors.name ? "border-red-400" : "border-border"}`}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>
                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={fields.phone}
                      onChange={e => setFields(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+27 83 441 1311"
                      className={`rounded-xl border px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary bg-background ${errors.phone ? "border-red-400" : "border-border"}`}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={fields.email}
                      onChange={e => setFields(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com"
                      className={`rounded-xl border px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary bg-background ${errors.email ? "border-red-400" : "border-border"}`}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>

                {/* Enquiry Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">
                    What are you enquiring about? <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="enquiry_type"
                    value={fields.enquiry_type}
                    onChange={e => setFields(f => ({ ...f, enquiry_type: e.target.value }))}
                    className={`rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background ${errors.enquiry_type ? "border-red-400" : "border-border"}`}
                  >
                    <option value="">Select an option</option>
                    <option value="Custom Commission">Custom Commission</option>
                    <option value="Workshop Booking">Workshop Booking</option>
                    <option value="Product Question">Product Question</option>
                    <option value="3 Day Resin Course">3 Day Resin Course</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.enquiry_type && <p className="text-xs text-red-500">{errors.enquiry_type}</p>}
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={fields.message}
                    onChange={e => setFields(f => ({ ...f, message: e.target.value }))}
                    rows={5}
                    placeholder="Tell us what you have in mind..."
                    className={`rounded-xl border px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none ${errors.message ? "border-red-400" : "border-border"}`}
                  />
                  {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                <label className="text-sm font-medium">How would you like to send this?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setContactMethod("email")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                      contactMethod === "email"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    Email Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod("whatsapp")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                      contactMethod === "whatsapp"
                        ? "border-emerald-600 bg-emerald-500/10 text-emerald-600"
                        : "border-border text-muted-foreground hover:border-emerald-500/50"
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className={`mt-2 flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-display font-semibold transition-opacity disabled:opacity-60 ${
                  contactMethod === "whatsapp"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {contactMethod === "whatsapp" ? (
                  <>
                    <MessageCircle className="h-5 w-5" />
                    Send via WhatsApp
                  </>
                ) : (
                  <>{status === "loading" ? "Sending..." : "Send Message"}</>
                )}
              </button>

                {status === "error" && (
                  <p className="text-center text-sm text-red-500 font-medium">
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </section>

      {/* Contact Cards
      <section className="mx-auto max-w-5xl px-6 lg:px-10 pb-24 grid md:grid-cols-2 gap-6">
        {[
          { Icon: MessageCircle, label: "WhatsApp", value: "+27 83 441 1311", href: "https://wa.me/27834411311" },
          { Icon: Phone, label: "Phone", value: "+27 83 441 1311", href: "tel:+27834411311" },
          { Icon: Mail, label: "Email", value: "faatimah@prettybits.co.za", href: "mailto:faatimah@prettybits.co.za" },
          { Icon: Instagram, label: "Instagram", value: "@prettybitsct", href: "https://instagram.com/prettybitsct" },
          { Icon: MapPin, label: "Location", value: "Goodwood, Cape Town", href: "#" },
        ].map(({ Icon, label, value, href }) => (
          <a
            key={label}
            href={href}
            className="group flex items-center gap-5 rounded-2xl border border-border bg-background p-6 hover:border-primary hover:shadow-soft transition-all"
          >
            <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-gradient-teal group-hover:text-primary-foreground transition-colors">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-1 font-display text-lg font-semibold">{value}</p>
            </div>
          </a>
        ))}
      </section> */}
    </>
  );
}
