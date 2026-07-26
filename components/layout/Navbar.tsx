"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutGrid, Sparkles } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { SearchBar } from "@/components/search/SearchBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/", label: "Latest", icon: Sparkles },
  { href: "/index/a/hentai", label: "Browse", icon: LayoutGrid },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 glass">
      <div className="container flex h-16 items-center gap-3">
        {/* Mobile: filter drawer trigger */}
        <div className="lg:hidden">
          <Sidebar variant="mobile" />
        </div>

        <Logo />

        {/* Desktop nav links */}
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href.split("/").slice(0, 2).join("/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Center search (desktop) */}
        <div className="mx-auto hidden w-full max-w-md md:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button asChild variant="ghost" size="icon" aria-label="Favorites">
            <Link href="/favorites">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile search row */}
      <div className="container pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
