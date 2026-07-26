"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/index/a/hentai",
    label: "Browse",
    icon: LayoutGrid,
    match: (p: string) => p.startsWith("/index") || p.startsWith("/genre"),
  },
  {
    href: "/search",
    label: "Search",
    icon: Search,
    match: (p: string) => p.startsWith("/search"),
  },
  {
    href: "/favorites",
    label: "Saved",
    icon: Heart,
    match: (p: string) => p.startsWith("/favorites"),
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 glass lg:hidden">
      <div className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "fill-primary/10")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
