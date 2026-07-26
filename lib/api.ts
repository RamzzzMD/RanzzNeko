import type { ListResponse, PostDetail, RelatedResponse, SeriesInfo } from "@/types";

/**
 * Client-side fetch helpers. These only ever hit our own /api/* routes — the
 * upstream credentials never reach the browser.
 */

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  latest: () => getJSON<ListResponse>("/api/latest"),

  search: (query: string, page = 1) =>
    getJSON<ListResponse>(
      `/api/search?q=${encodeURIComponent(query)}&page=${page}`
    ),

  indeks: (letter: string, type: string, page = 1) =>
    getJSON<ListResponse>(
      `/api/indeks?letter=${encodeURIComponent(letter)}&type=${encodeURIComponent(
        type
      )}&page=${page}`
    ),

  genre: (genre: string) =>
    getJSON<ListResponse>(`/api/genre?genre=${encodeURIComponent(genre)}`),

  detail: (id: string) => getJSON<PostDetail>(`/api/post/${encodeURIComponent(id)}`),

  series: (id: string) => getJSON<SeriesInfo>(`/api/series/${encodeURIComponent(id)}`),

  related: (title: string, exclude: string) =>
    getJSON<RelatedResponse>(
      `/api/related?title=${encodeURIComponent(title)}&exclude=${encodeURIComponent(exclude)}`
    ),
};

/** Query keys for React Query. */
export const queryKeys = {
  latest: ["latest"] as const,
  search: (q: string, page: number) => ["search", q, page] as const,
  indeks: (letter: string, type: string, page: number) =>
    ["indeks", letter, type, page] as const,
  genre: (g: string) => ["genre", g] as const,
  detail: (id: string) => ["detail", id] as const,
  series: (id: string) => ["series", id] as const,
  related: (title: string, exclude: string) => ["related", title, exclude] as const,
};
