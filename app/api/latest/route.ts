import { neko } from "@/lib/nekopoi";
import { normalizeList } from "@/lib/normalize";
import { handleRoute } from "@/lib/apiHandler";

// Always run fresh — never serve a cached "latest" list.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  return handleRoute(
    async () => {
      const raw = await neko.latest();
      return normalizeList(raw, 1);
    },
    // No edge/browser caching so newly added content appears right away.
    { cacheControl: "no-store, max-age=0, must-revalidate" }
  );
}
