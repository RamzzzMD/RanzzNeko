import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Turn a slug/id like "big_oppai" into "Big Oppai" for display. */
export function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Small helper to build a tiny shimmering blur placeholder for next/image. */
export function shimmer(w: number, h: number): string {
  const svg = `
  <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g">
        <stop stop-color="#111" offset="20%" />
        <stop stop-color="#1c1c1c" offset="50%" />
        <stop stop-color="#111" offset="70%" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="#111" />
    <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
  </svg>`;

  const toBase64 = (str: string) =>
    typeof window === "undefined"
      ? Buffer.from(str).toString("base64")
      : window.btoa(str);

  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}

/** Clamp / normalize a page number coming from query params. */
export function normalizePage(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

/** Format a possibly-missing string with a fallback. */
export function orDash(value?: string | null): string {
  return value && value.trim().length > 0 ? value : "—";
}
