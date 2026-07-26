import { type NextRequest } from "next/server";
import { neko } from "@/lib/nekopoi";
import { normalizeDetail, normalizeList } from "@/lib/normalize";
import { handleRoute } from "@/lib/apiHandler";
import type { RelatedEpisode } from "@/types";

export const dynamic = "force-dynamic";

/** "Foo Bar Episode 2 Subtitle Indonesia" → "Foo Bar" */
function baseTitle(title: string): string {
  return title
    .replace(/\b(episode|episod|eps?|part|vol(ume)?)\s*\.?\s*\d+.*$/i, "")
    .replace(/\b(subtitle|sub)\s+indonesia\b.*$/i, "")
    .replace(/\b(uncensored|censored|end|tamat)\b/gi, "")
    .replace(/[\[\](){}|~_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract an episode number from a title for natural ordering. */
function episodeNumber(title: string): number {
  const m =
    title.match(/\b(?:episode|episod|eps?)\s*\.?\s*(\d+)/i) ??
    title.match(/\b(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

const MAX_EPISODES = 12;

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title") ?? "";
  const exclude = req.nextUrl.searchParams.get("exclude") ?? "";

  return handleRoute(async () => {
    const q = baseTitle(title);
    if (!q) return { episodes: [] };

    // Find sibling posts that share the base title.
    const raw = await neko.search(q, 1);
    const list = normalizeList(raw, 1);
    const ql = q.toLowerCase();
    const matches = list.items
      .filter((p) => p.id && p.title.toLowerCase().includes(ql))
      .slice(0, MAX_EPISODES);

    // Pull each sibling's detail to get its download/stream links.
    const details = await Promise.all(
      matches.map(async (m): Promise<RelatedEpisode | null> => {
        try {
          const d = normalizeDetail(await neko.detail(m.id));
          const downloads = d.downloads.length
            ? d.downloads
            : d.episodes.flatMap((e) => e.downloads);
          return {
            id: m.id,
            title: d.title !== "Untitled" ? d.title : m.title,
            thumbnail: d.thumbnail ?? m.thumbnail,
            released: d.released,
            downloads,
            players: d.players,
          };
        } catch {
          return null; // one broken sibling shouldn't kill the list
        }
      })
    );

    const episodes = details
      .filter((e): e is RelatedEpisode => Boolean(e))
      .filter((e) => e.id !== exclude);

    episodes.sort(
      (a, b) =>
        episodeNumber(a.title) - episodeNumber(b.title) ||
        a.title.localeCompare(b.title)
    );

    return { episodes };
  });
}
