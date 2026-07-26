/**
 * Normalized types returned by our /api/* routes to the client.
 *
 * The upstream API's exact JSON shape is not strictly documented, so the
 * server normalizes each response into these predictable shapes (see
 * lib/normalize.ts). Every field the UI relies on is optional-safe.
 */

export interface Post {
  id: string;
  title: string;
  thumbnail: string | null;
  type: string | null;
  /** e.g. episode label, duration, or release info when present. */
  meta: string | null;
  /** Genres attached to the item, if the upstream provided them. */
  genres: string[];
  /** Link/slug from upstream, kept for reference. */
  url: string | null;
}

export interface PostDetailDownload {
  quality: string | null;
  provider: string | null;
  url: string | null;
}

export interface DownloadEpisode {
  title: string | null;
  downloads: PostDetailDownload[];
}

export interface PostDetail extends Post {
  description: string | null;
  released: string | null;
  duration: string | null;
  producer: string | null;
  seriesId: string | null;
  screenshots: string[];
  players: { label: string | null; url: string | null }[];
  downloads: PostDetailDownload[];
  /** Per-episode downloads (multi-episode content), arranged in order. */
  episodes: DownloadEpisode[];
}

export interface SeriesInfo {
  id: string;
  title: string;
  thumbnail: string | null;
  description: string | null;
  genres: string[];
  episodes: Post[];
}

export interface Pagination {
  currentPage: number;
  totalPages: number | null;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ListResponse {
  items: Post[];
  pagination: Pagination;
  /** The raw upstream payload, in case the UI wants extra fields. */
  raw?: unknown;
}

export interface ApiError {
  error: string;
}

/** Local (localStorage) records. */
export interface RecentItem {
  id: string;
  title: string;
  thumbnail: string | null;
  type: string | null;
  viewedAt: number;
}

export interface SearchHistoryItem {
  query: string;
  at: number;
}
