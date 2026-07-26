import { type NextRequest } from "next/server";
import { neko } from "@/lib/nekopoi";
import { normalizeList } from "@/lib/normalize";
import { handleRoute } from "@/lib/apiHandler";

// Always run fresh — never serve a cached "latest" list.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  // Debug: /api/latest?raw=1 returns the untouched upstream JSON so you can
  // inspect the exact field names. Remove or protect this before production.
  const raw = req.nextUrl.searchParams.get("raw");

  return handleRoute(
    async () => {
      const payload = await neko.latest();
      if (raw) return payload;
      return normalizeList(payload, 1);
    },
    { cacheControl: "no-store, max-age=0, must-revalidate" }
  );
}
