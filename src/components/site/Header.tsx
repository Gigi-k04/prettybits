import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";

const workshopSubLinks = [
  { to: "/workshops" as const, hash: "regular-workshops", label: "Regular Workshops" },
  { to: "/workshops" as const, hash: "river-table-workshops", label: "River Table" },
  { to: "/workshops" as const, hash: "private-workshops", label: "Private & Corporate" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-20 flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="flex items-baseline gap-1 group">
          <span className="font-script text-5xl text-primary leading-none">PrettyBits</span>
          <span className="hidden min-[1600px]:inline-block ml-3 pl-3 border-l border-teal/40 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground self-center">
            Resin&nbsp;Art&nbsp;·&nbsp;Workshops
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            activeProps={{ className: "text-primary" }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>

          {/* Workshops Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <Link
              to="/workshops"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              activeProps={{ className: "text-primary" }}
            >
              Workshops
              <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </Link>

            {dropdownOpen && (
              <div className="absolute top-full left-0 w-52 rounded-2xl border border-border bg-background shadow-soft p-2 flex flex-col gap-1 z-50">
                {workshopSubLinks.map((sub) => (
                  <Link
                    key={sub.hash}
                    to={sub.to}
                    hash={sub.hash}
                    className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-xl transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/courses"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            activeProps={{ className: "text-primary" }}
          >
            Courses
          </Link>

          <Link
            to="/products"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            activeProps={{ className: "text-primary" }}
          >
            Products
          </Link>

          <Link
            to="/starter-kit"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            activeProps={{ className: "text-primary" }}
          >
            Starter Kits
          </Link>

          <Link
            to="/contact"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            activeProps={{ className: "text-primary" }}
          >
            Contact
          </Link>
          
        </nav>

        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background">
          <div className="px-6 py-6 flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="text-base font-medium text-foreground"
            >
              Home
            </Link>

            {/* Mobile Workshops Accordion */}
            <div className="flex flex-col gap-2">
              <Link
                to="/workshops"
                onClick={() => setOpen(false)}
                className="text-base font-medium text-primary"
              >
                Workshops
              </Link>
              <div className="pl-4 flex flex-col gap-2 border-l border-border">
                {workshopSubLinks.map((sub) => (
                  <Link
                    key={sub.hash}
                    to={sub.to}
                    hash={sub.hash}
                    onClick={() => setOpen(false)}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/courses"
              onClick={() => setOpen(false)}
              className="text-base font-medium text-foreground"
            >
              Courses
            </Link>
            <Link
              to="/products"
              onClick={() => setOpen(false)}
              className="text-base font-medium text-foreground"
            >
              Products
            </Link>
            <Link
              to="/starter-kit"
              onClick={() => setOpen(false)}
              className="text-base font-medium text-foreground"
            >
              Starter Kits
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="text-base font-medium text-foreground"
            >
              Contact
            </Link>
            
          </div>
        </div>
      )}
    </header>
  );
}
