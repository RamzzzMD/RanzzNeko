import { type NextRequest } from "next/server";
import { neko } from "@/lib/nekopoi";
import { normalizeList } from "@/lib/normalize";
import { handleRoute } from "@/lib/apiHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleRoute(async () => {
    const genre = req.nextUrl.searchParams.get("genre") ?? "";
    const raw = await neko.genre(genre);
    return normalizeList(raw, 1);
  });
}
