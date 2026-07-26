/**
 * Shared, client-safe constants.
 *
 * NOTE: `loli` and `shota` are intentionally removed from the genre list for
 * legal reasons. They must never be exposed in the UI or accepted by the API
 * layer. See lib/nekopoi.ts (BLOCKED_GENRES) for the server-side enforcement.
 */

export const LETTERS = [
  "0-9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
] as const;

export type Letter = (typeof LETTERS)[number];

export const TYPES = [
  "hentai",
  "2d_animation",
  "3d_hentai",
  "jav",
  "jav_cosplay",
] as const;

export type ContentType = (typeof TYPES)[number];

export const TYPE_LABELS: Record<ContentType, string> = {
  hentai: "Hentai",
  "2d_animation": "2D Animation",
  "3d_hentai": "3D Hentai",
  jav: "JAV",
  jav_cosplay: "JAV Cosplay",
};

/**
 * Genres blocked for legal reasons — never rendered, never sent upstream.
 * Enforced again on the server in lib/nekopoi.ts.
 */
export const BLOCKED_GENRES = ["loli", "shota"] as const;

/**
 * IMPORTANT: This array MUST preserve the exact ordering of the upstream
 * genre list, because the API resolves a genre to its numeric term via its
 * index. Removing loli/shota here would shift every following index and break
 * genre browsing. Instead we keep the full ordered list private and expose a
 * filtered view for the UI while mapping back to the original index server-side.
 */
export const RAW_GENRES = [
  "action",
  "ahegao",
  "anal",
  "armpit",
  "bdsm",
  "big_oppai",
  "blackmail",
  "blonde",
  "blowjob",
  "bondage",
  "comedy",
  "creampie",
  "dark_skin",
  "dilf",
  "elf",
  "exhibitionist",
  "fellatio",
  "female_monster",
  "femdom",
  "footjob",
  "forced",
  "furry",
  "futanari",
  "gangbang",
  "gore",
  "handjob",
  "harem",
  "horror",
  "housewife",
  "humilation",
  "humiliation",
  "hypnotize",
  "incest",
  "intercrural",
  "jav",
  "lactation",
  "loli",
  "maid",
  "male_monster",
  "masturbation",
  "megane",
  "milf",
  "mind_control",
  "monster",
  "netorare",
  "nurse",
  "old_man",
  "onee_san",
  "oral",
  "paizuri",
  "pantyhose",
  "pregnant",
  "prostitution",
  "rape",
  "romance",
  "saimin",
  "schoolgirl",
  "semi_hentai",
  "sex_toys",
  "shibari",
  "shota",
  "stocking",
  "succubus",
  "supranatural",
  "swimsuit",
  "tentacles",
  "threesome",
  "tsundere",
  "ugly_bastard",
  "uncensored",
  "vanilla",
  "virgin",
  "yaoi",
  "yuri",
] as const;

/** Public, UI-safe genre list (loli/shota removed). */
export const GENRES = RAW_GENRES.filter(
  (g) => !BLOCKED_GENRES.includes(g as (typeof BLOCKED_GENRES)[number])
);

export type Genre = string;

export const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "title_desc", label: "Title Z–A" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const SITE = {
  name: "RanzzNeko",
  tagline: "Modern hentai & JAV catalog",
  description:
    "RanzzNeko — a fast, modern, mobile-first catalog for browsing hentai and JAV content. Search, browse by letter, type, and genre.",
  url: "https://ranzzneko.vercel.app",
} as const;
