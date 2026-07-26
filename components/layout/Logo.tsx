import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 font-bold", className)}
      aria-label="RanzzNeko home"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
        {/* Stylized cat icon */}
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4l3 4 M20 4l-3 4" />
          <path d="M5 8c-1 2-1 5-1 7a8 4 0 0 0 16 0c0-2 0-5-1-7" />
          <circle cx="9.5" cy="12" r="0.6" fill="currentColor" />
          <circle cx="14.5" cy="12" r="0.6" fill="currentColor" />
          <path d="M11 15h2" />
        </svg>
      </span>
      <span className="text-lg tracking-tight">
        Ranzz<span className="text-gradient">Neko</span>
      </span>
    </Link>
  );
}
