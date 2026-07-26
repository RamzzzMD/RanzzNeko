import { type NextRequest } from "next/server";
import { neko } from "@/lib/nekopoi";
import { normalizeList } from "@/lib/normalize";
import { handleRoute } from "@/lib/apiHandler";
import { normalizePage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleRoute(async () => {
    const letter = req.nextUrl.searchParams.get("letter") ?? "";
    const type = req.nextUrl.searchParams.get("type") ?? "";
    const page = normalizePage(req.nextUrl.searchParams.get("page"));
    const raw = await neko.indeks(letter, type, page);
    return normalizeList(raw, page);
  });
}
