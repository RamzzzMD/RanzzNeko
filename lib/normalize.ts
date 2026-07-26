import "server-only";
import type {
  ListResponse,
  Pagination,
  Post,
  PostDetail,
  SeriesInfo,
} from "@/types";
import { BLOCKED_GENRES } from "@/lib/nekopoi";

/**
 * The upstream API's JSON shape isn't strictly documented and can vary between
 * endpoints, so these helpers defensively pull values from a range of likely
 * field names and produce the normalized shapes our client consumes.
 */
const NESTED_LIST_KEYS = [
  "data", "result", "results", "posts", "items",
  "list", "content", "videos", "recent", "children",
];

type AnyObj = Record<string, any>;

function pickString(obj: AnyObj, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return null;
}

function pickArray(obj: AnyObj, keys: string[]): any[] {
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v)) return v;
  }
  return [];
}

/** Find the most likely "list of items" array inside an arbitrary payload. */
function nestedPostArray(entry: any): any[] | null {
  if (!entry || typeof entry !== "object") return null;
  for (const k of NESTED_LIST_KEYS) {
    if (Array.isArray(entry[k]) && entry[k].length) return entry[k];
  }
  return null;
}

function stripBlockedGenres(genres: string[]): string[] {
  return genres.filter((g) => !BLOCKED_GENRES.has(String(g).toLowerCase()));
}

function normalizeGenres(raw: any[]): string[] {
  const out: string[] = [];
  for (const g of raw) {
    if (typeof g === "string") out.push(g);
    else if (g && typeof g === "object") {
      const name = pickString(g, ["name", "title", "genre", "label", "slug"]);
      if (name) out.push(name);
    }
  }
  return stripBlockedGenres(out);
}

export function normalizePost(raw: AnyObj): Post {
  const id =
    pickString(raw, ["id", "post_id", "postId", "ID", "_id"]) ??
    // Try to extract a trailing numeric id from a url/permalink.
    (() => {
      const url = pickString(raw, ["url", "link", "permalink"]);
      const m = url?.match(/(\d+)/);
      return m ? m[1] : "";
    })();

  return {
    id: id ?? "",
    title:
      pickString(raw, ["title", "name", "post_title", "judul"]) ?? "Untitled",
    thumbnail: pickString(raw, [
      "thumbnail",
      "thumb",
      "image",
      "img",
      "cover",
      "poster",
      "featured_image",
    ]),
    type: pickString(raw, ["type", "category", "content_type", "tipe"]),
    meta: pickString(raw, ["episode", "eps", "meta", "info", "quality", "date"]),
    genres: normalizeGenres(pickArray(raw, ["genres", "genre", "tags", "categories"])),
    url: pickString(raw, ["url", "link", "permalink", "slug"]),
  };
}

export function normalizePagination(
  payload: any,
  currentPage: number,
  itemCount: number
): Pagination {
  const totalPagesRaw =
    payload?.total_pages ??
    payload?.totalPages ??
    payload?.pages ??
    payload?.last_page ??
    payload?.pagination?.total_pages ??
    payload?.pagination?.totalPages ??
    null;
  const totalPages =
    totalPagesRaw != null && Number.isFinite(Number(totalPagesRaw))
      ? Number(totalPagesRaw)
      : null;

  const hasNextRaw =
    payload?.has_next ??
    payload?.hasNext ??
    payload?.next_page ??
    payload?.pagination?.has_next;

  const hasNext =
    typeof hasNextRaw === "boolean"
      ? hasNextRaw
      : totalPages != null
        ? currentPage < totalPages
        : // Heuristic: a full-looking page probably has a next page.
          itemCount >= 12;

  return {
    currentPage,
    totalPages,
    hasNext,
    hasPrev: currentPage > 1,
  };
}

export function normalizeList(payload: any, currentPage = 1): ListResponse {
  const arr = findItemsArray(payload);

  // /recent groups posts by type: top-level is a list of sections like
  // { type: "hentai", data: [...posts] }. Flatten them, carrying the
  // section type down onto each post. Flat posts are handled directly.
  const items: Post[] = [];
  for (const entry of arr) {
    const nested = nestedPostArray(entry);
    if (nested) {
      const sectionType = pickString(entry, [
        "type", "category", "content_type", "tipe", "slug", "title", "name",
      ]);
      for (const raw of nested) {
        const post = normalizePost(raw);
        if (!post.type && sectionType) post.type = sectionType;
        items.push(post);
      }
    } else {
      items.push(normalizePost(entry));
    }
  }
const cleaned = items.filter((p) => p.id || (p.title && p.title !== "Untitled"));
  return {
    items: cleaned.length ? cleaned : items,
    pagination: normalizePagination(payload, currentPage, cleaned.length),
  };
}

export function normalizeDetail(payload: any): PostDetail {
  // The detail payload may nest the post under data/result/post.
  const root =
    payload?.data ?? payload?.result ?? payload?.post ?? payload ?? {};
  const base = normalizePost(root);

  const screenshots = pickArray(root, ["screenshots", "images", "gallery"])
    .map((s: any) =>
      typeof s === "string" ? s : pickString(s, ["url", "src", "image"])
    )
    .filter((s): s is string => Boolean(s));

  const players = pickArray(root, ["players", "stream", "streams", "embeds"])
    .map((p: any) => ({
      label:
        typeof p === "string"
          ? null
          : pickString(p, ["label", "name", "server", "provider"]),
      url: typeof p === "string" ? p : pickString(p, ["url", "src", "embed"]),
    }))
    .filter((p) => p.url);

  return {
    ...base,
    description: pickString(root, ["description", "synopsis", "desc", "content"]),
    released: pickString(root, ["released", "release", "date", "aired"]),
    duration: pickString(root, ["duration", "length", "runtime"]),
    seriesId: pickString(root, ["series_id", "seriesId", "series"]),
    screenshots,
    players,
  };
}

export function normalizeSeries(payload: any): SeriesInfo {
  const root =
    payload?.data ?? payload?.result ?? payload?.series ?? payload ?? {};
  const base = normalizePost(root);
  const episodes = findItemsArray(
    root.episodes ?? root.posts ?? root.list ?? payload
  ).map(normalizePost);

  return {
    id: base.id,
    title: base.title,
    thumbnail: base.thumbnail,
    description: pickString(root, ["description", "synopsis", "desc"]),
    genres: base.genres,
    episodes,
  };
}
