"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import UserProfile from "./user-profile";
import { Menu, MoreHorizontal } from "lucide-react";
import React from "react";
import { usePathname } from "next/navigation";

const MAIN_LINKS = [
  { href: "/dashboard/inventory", label: "Inventory" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/payments", label: "Payments" },
  { href: "/dashboard/expenses", label: "Expenses" },
];
const MORE_LINKS = [
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/deliveries", label: "Deliveries" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/reports", label: "Reports" },
];

export default function NavbarClient({ user }: { user: any }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const showDashboardLinks = pathname && (pathname === "/dashboard" || pathname.startsWith("/dashboard"));

  return (
    <nav className="w-full border-b border-border bg-background py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="text-xl font-bold text-orange-600">
          TileManager Pro
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              {showDashboardLinks && (
                <>
                  {/* Desktop nav links: show all */}
                  <div className="hidden md:flex gap-2">
                    {MAIN_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    ))}
                    {MORE_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  {/* Mobile hamburger menu: only main links, more in dropdown */}
                  <div className="md:hidden relative flex items-center gap-2">
                    {MAIN_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="px-2 py-2 text-sm font-medium text-foreground hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Open more menu"
                      onClick={() => setMoreOpen((open) => !open)}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                    {moreOpen && (
                      <div className="absolute right-0 mt-2 w-40 bg-background border border-border rounded shadow-lg z-50">
                        {MORE_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary"
                            onClick={() => setMoreOpen(false)}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium text-primary bg-primary-foreground rounded-md hover:bg-primary/80"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 