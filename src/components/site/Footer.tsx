import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MessageCircle, Mail, Music2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 grid gap-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-baseline gap-1">
            <span className="font-script text-4xl text-primary leading-none">PrettyBits</span>
            {/* <span className="font-script text-4xl text-foreground leading-none">Bits</span> */}
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
            Handcrafted resin art, functional decor and creative workshops.
            Made with love in Cape Town since 2021.
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { Icon: Instagram, href: "https://www.instagram.com/prettybitsct?igsh=MXRrcG12enY2Mm5wMA==", label: "Instagram" },
              {Icon: Music2 , href: "https://www.tiktok.com/@prettybitsct", label: "TikTok" },
              { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=100054538385752", label: "Facebook" },
              { Icon: MessageCircle, href: "https://wa.me/message/MXZBFIEX5RD5J1", label: "WhatsApp" },
              { Icon: Mail, href: "#", label: "Email" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank" // Opens in a new tab
                rel="noopener noreferrer" // Security best practice
                className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase">Explore</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/workshops" className="hover:text-primary">Workshops</Link></li>
            <li><Link to="/courses" className="hover:text-primary">Courses</Link></li>
            <li><Link to="/products" className="hover:text-primary">Products</Link></li>
            <li><Link to="/starter-kit" className="hover:text-primary">Starter Kits</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase">Visit</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>PrettyBits </li>
            <li>Goodwood, Cape Town</li>
            <li>South Africa</li>
            <li className="pt-2 text-foreground">+27 83 441 1311</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase">Hours</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <span className="block text-xs font-semibold text-foreground uppercase tracking-wider">Mon - Fri</span>
              <span>Open: 10:00 - 16:00</span>             
            </li>
            <li>
              <span className="block text-xs font-semibold text-foreground uppercase tracking-wider">Friday</span>
              <span>Closed: 12:00-14:00</span>
            </li>
            <li>
              <span className="block text-xs font-semibold text-foreground uppercase tracking-wider">Sat - Sun</span>
              <span>Workshop Days</span>
            </li>
           
          </ul>
        </div>

      </div>

     

      

      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} PrettyBits. All rights reserved.</p>
          <p>Lets Get Creative.</p>
        </div>
      </div>
    </footer>
  );
}
