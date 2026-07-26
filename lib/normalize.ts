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
const EPISODE_KEYS = [
  "episodes", "episode", "eps", "episode_list", "episodeList",
  "chapters", "parts", "list",
];

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

function findItemsArray(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object") {
    return pickArray(payload, NESTED_LIST_KEYS);
  }
  return [];
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

function stripHtml(input: string): string {
  if (!input) return "";
  let s = input;
  s = s.replace(/<\s*(br|\/p|\/h[1-6]|\/div|\/li|\/tr)\s*\/?>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  s = s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&hellip;/gi, "…");
  return s
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

const SYNOPSIS_LABEL_RE =
  /^(genres?|producers?|studio|duration|durasi|size|ukuran|catatan|notes?|status|type|tipe|released?|rilis|quality|kualitas)\s*[:\-]/i;

function parseSynopsis(rawHtml: string): {
  synopsis: string | null;
  duration: string | null;
  producer: string | null;
  genres: string[];
} {
  const text = stripHtml(rawHtml);
  if (!text) return { synopsis: null, duration: null, producer: null, genres: [] };

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const synopsisLines: string[] = [];
  let duration: string | null = null;
  let producer: string | null = null;
  let genres: string[] = [];
  let hitLabel = false;

  for (const line of lines) {
    if (/^(sinopsis|synopsis)\s*:?\s*$/i.test(line)) continue;

    const m = line.match(SYNOPSIS_LABEL_RE);
    if (m) {
      hitLabel = true;
      const label = m[1].toLowerCase();
      const value = line.slice(m[0].length).trim();
      if (label.startsWith("durat") || label === "durasi") duration ||= value || null;
      else if (label.startsWith("produc") || label === "studio")
        producer ||= value || null;
      else if (label.startsWith("genre"))
        genres = value
          .split(/[,|]/)
          .map((g) => g.trim().toLowerCase().replace(/\s+/g, "_"))
          .filter(Boolean);
      continue;
    }

    if (!hitLabel) synopsisLines.push(line);
  }

  return {
    synopsis: synopsisLines.join("\n").trim() || null,
    duration,
    producer,
    genres: stripBlockedGenres(genres),
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
    .map((p: any, i: number) => ({
      label:
        (typeof p === "string"
          ? null
          : pickString(p, ["label", "name", "server", "provider"])) ??
        `Stream ${i + 1}`,
      url:
        typeof p === "string"
          ? p
          : pickString(p, ["url", "src", "embed", "link", "href"]),
    }))
    .filter((p) => p.url);

  const rawDesc =
    pickString(root, ["description", "synopsis", "desc", "content", "sinopsis"]) ??
    "";
  const parsed = parseSynopsis(rawDesc);

  return {
    ...base,
    streamNote: stripHtml(
      pickString(root, ["streamnote", "stream_note", "streamNote"]) ?? ""
    ) || null,
    description: parsed.synopsis ?? (rawDesc ? stripHtml(rawDesc) : null),
    released: pickString(root, ["released", "release", "date", "aired"]),
    duration:
      pickString(root, ["duration", "length", "runtime"]) ?? parsed.duration,
    producer:
      pickString(root, ["producer", "producers", "studio", "maker", "brand"]) ??
      parsed.producer,
    seriesId: pickString(root, ["series_id", "seriesId", "series"]),
    screenshots,
    players,
    downloads: normalizeDownloads(root),
    episodes: normalizeEpisodes(root),
    genres: base.genres.length ? base.genres : parsed.genres,
  };
}

function normalizeDownloads(root: AnyObj): PostDetail["downloads"] {
  const out: PostDetail["downloads"] = [];
  const keys = [
    "downloads", "download", "download_links", "downloadLinks",
    "download_url", "links", "mirror", "mirrors",
  ];

  const pushLink = (quality: string | null, provider: string | null, url: string | null) => {
    if (url) out.push({ quality, provider, url });
  };

  const readLinkObj = (item: AnyObj, quality: string | null) => {
    const inner = pickArray(item, ["links", "urls", "mirrors", "providers", "data"]);
    if (inner.length) {
      for (const li of inner) {
        if (typeof li === "string") pushLink(quality, null, li);
        else pushLink(quality,
          pickString(li, ["provider", "host", "server", "name", "label"]),
          pickString(li, ["url", "link", "href"]));
      }
    } else {
      pushLink(
        quality ?? pickString(item, ["quality", "resolution", "res", "label", "name", "size"]),
        pickString(item, ["provider", "host", "server", "name", "label"]),
        pickString(item, ["url", "link", "href"]));
    }
  };

  for (const key of keys) {
    const v = root?.[key];
    if (!v) continue;
    if (Array.isArray(v)) {
      for (const item of v) {
        if (typeof item === "string") pushLink(null, null, item);
        else if (item && typeof item === "object")
          readLinkObj(item, pickString(item, ["quality", "resolution", "res", "label", "name"]));
      }
    } else if (typeof v === "object") {
      for (const [quality, val] of Object.entries(v)) {
        if (typeof val === "string") pushLink(quality, null, val);
        else if (Array.isArray(val)) {
          for (const li of val as any[]) {
            if (typeof li === "string") pushLink(quality, null, li);
            else pushLink(quality,
              pickString(li, ["provider", "host", "server", "name", "label"]),
              pickString(li, ["url", "link", "href"]));
          }
        } else if (val && typeof val === "object") {
          readLinkObj(val as AnyObj, quality);
        }
      }
    } else if (typeof v === "string") {
      pushLink(null, null, v);
    }
  }
  return out;
}

function normalizeEpisodes(root: AnyObj): PostDetail["episodes"] {
  const out: PostDetail["episodes"] = [];

  let arr: any[] = [];
  for (const k of EPISODE_KEYS) {
    if (Array.isArray(root?.[k]) && root[k].length) { arr = root[k]; break; }
  }

  if (arr.length) {
    arr.forEach((ep, i) => {
      const isObj = ep && typeof ep === "object";
      const downloads = normalizeDownloads(isObj ? ep : {});
      if (!downloads.length) return;
      const title =
        (isObj
          ? pickString(ep, ["title", "name", "episode", "eps", "label", "judul"])
          : null) ?? `Episode ${i + 1}`;
      out.push({ title, downloads });
    });
  }

  // Fallback: single-episode content with links directly on the root.
  if (!out.length) {
    const rootDownloads = normalizeDownloads(root);
    if (rootDownloads.length) out.push({ title: null, downloads: rootDownloads });
  }

  return out;
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
