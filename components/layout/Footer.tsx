import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/70 pb-20 pt-10 lg:pb-10">
      <div className="container flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            {SITE.tagline}. A catalog interface only — no files are hosted here.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Latest
          </Link>
          <Link href="/index/a/hentai" className="hover:text-primary">
            Browse
          </Link>
          <Link href="/search" className="hover:text-primary">
            Search
          </Link>
          <Link href="/favorites" className="hover:text-primary">
            Favorites
          </Link>
        </nav>
      </div>
      <div className="container mt-8 border-t border-border/50 pt-6 text-xs text-muted-foreground">
        <p>
          18+ only. This site is an unofficial catalog front-end. All content
          belongs to its respective owners.
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} {SITE.name}. For adult audiences.
        </p>
      </div>
    </footer>
  );
}
