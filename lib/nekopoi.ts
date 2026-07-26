import "server-only";
import axios, { type AxiosInstance } from "axios";

/**
 * NekoPoi — server-only data layer.
 *
 * This file must NEVER be imported into a client component. The `server-only`
 * import above will throw at build time if that happens, keeping the token and
 * base URL off the client bundle. All access from the browser goes through the
 * /api/* routes.
 *
 * Credentials are currently hardcoded (per project spec). To move them to env
 * vars later, read process.env.NEKO_* here — the .env.example documents the keys.
 */

const BASE_URL =
  process.env.NEKO_BASE_URL ||
  "https://api.explorethefrontierforlimitlessimaginationanddiscov.com/330cceade91a6a9cd30fb8042222ed56/71b8acf33b508c7543592acd9d9eb70d";

const TOKEN =
  process.env.NEKO_TOKEN ||
  "XbGSFkQsJYbFC6pcUMCFL4oNHULvHU7WdDAXYgpmqYlh7p5ZCQ4QZ13GDgowiOGvAejz9X5H6DYvEQBMrc3A17SO3qwLwVkbn6YY";

const APP_BUILD_CODE = process.env.NEKO_APP_BUILD_CODE || "25301";

const APP_SIGNATURE =
  process.env.NEKO_APP_SIGNATURE ||
  "pOplm8IDEDGXN55IaYohQ8CzJFvWsfXyhGvwPRD9kWgzYSRuuvAOPfsE0AJbHVbAJyWGsGCNUIuQLJ7HbMbuFLMWwDgHNwxOrYMH";

export const LETTERS = [
  "0-9",
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
];

export const TYPES = ["hentai", "2d_animation", "3d_hentai", "jav", "jav_cosplay"];

/**
 * Full, ordered genre list exactly as upstream expects it. The numeric term
 * for /searchByGenre is the index in THIS array, so the order and contents
 * must not change. loli/shota stay present here only so indexes line up; they
 * are blocked from ever being requested by BLOCKED_GENRES below.
 */
export const RAW_GENRES = [
  "action", "ahegao", "anal", "armpit", "bdsm", "big_oppai", "blackmail",
  "blonde", "blowjob", "bondage", "comedy", "creampie", "dark_skin", "dilf",
  "elf", "exhibitionist", "fellatio", "female_monster", "femdom", "footjob",
  "forced", "furry", "futanari", "gangbang", "gore", "handjob", "harem",
  "horror", "housewife", "humilation", "humiliation", "hypnotize", "incest",
  "intercrural", "jav", "lactation", "loli", "maid", "male_monster",
  "masturbation", "megane", "milf", "mind_control", "monster", "netorare",
  "nurse", "old_man", "onee_san", "oral", "paizuri", "pantyhose", "pregnant",
  "prostitution", "rape", "romance", "saimin", "schoolgirl", "semi_hentai",
  "sex_toys", "shibari", "shota", "stocking", "succubus", "supranatural",
  "swimsuit", "tentacles", "threesome", "tsundere", "ugly_bastard",
  "uncensored", "vanilla", "virgin", "yaoi", "yuri",
];

/** Blocked for legal reasons — refused at the data layer. */
export const BLOCKED_GENRES = new Set(["loli", "shota"]);

export class NekoError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "NekoError";
    this.status = status;
  }
}

class NekoPoi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 20000,
      headers: {
        token: TOKEN,
        accept: "application/json",
        appbuildcode: APP_BUILD_CODE,
        appsignature: APP_SIGNATURE,
        "accept-encoding": "gzip",
        "user-agent": "okhttp/4.10.0",
      },
    });
  }

  private async fetch<T = unknown>(url: string): Promise<T> {
    try {
      const { data } = await this.client.get<T>(url);
      return data;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const status = e.response?.status ?? 502;
        throw new NekoError(
          `Upstream request failed (${status}) for ${url}`,
          status >= 400 && status < 600 ? status : 502
        );
      }
      throw new NekoError((e as Error).message || "Unknown upstream error", 502);
    }
  }

  private validatePage(page: string | number): string {
    const n = Number(page);
    if (!Number.isFinite(n) || n < 1) throw new NekoError("Invalid page input.");
    return String(Math.floor(n));
  }

  async latest<T = unknown>(): Promise<T> {
    return this.fetch<T>("/recent");
  }

  async indeks<T = unknown>(
    letter: string,
    type: string,
    page: string | number = "1"
  ): Promise<T> {
    if (!LETTERS.includes(letter))
      throw new NekoError(`Available letters: ${LETTERS.join(", ")}.`);
    if (!TYPES.includes(type))
      throw new NekoError(`Available types: ${TYPES.join(", ")}.`);
    const p = this.validatePage(page);
    return this.fetch<T>(
      `/listall?letter=${encodeURIComponent(letter)}&type=${encodeURIComponent(
        type
      )}&page=${p}`
    );
  }

  async genre<T = unknown>(genre: string): Promise<T> {
    if (BLOCKED_GENRES.has(genre))
      throw new NekoError("This genre is not available.", 403);
    const term = RAW_GENRES.indexOf(genre);
    if (term < 0)
      throw new NekoError("Unknown genre.", 404);
    return this.fetch<T>(`/searchByGenre?term=${term}`);
  }

  async search<T = unknown>(
    query: string,
    page: string | number = "1"
  ): Promise<T> {
    if (!query || !query.trim()) throw new NekoError("Query is required.");
    const p = this.validatePage(page);
    return this.fetch<T>(
      `/search?q=${encodeURIComponent(query.trim())}&page=${p}`
    );
  }

  async detail<T = unknown>(id: string | number): Promise<T> {
    if (id === undefined || id === null || isNaN(Number(id)))
      throw new NekoError("A numeric ID is required.");
    return this.fetch<T>(`/post?id=${encodeURIComponent(String(id))}`);
  }

  async series<T = unknown>(id: string | number): Promise<T> {
    if (id === undefined || id === null || isNaN(Number(id)))
      throw new NekoError("A numeric ID is required.");
    return this.fetch<T>(`/series?id=${encodeURIComponent(String(id))}`);
  }
}

/** Singleton — reused across requests in the same server runtime. */
export const neko = new NekoPoi();
