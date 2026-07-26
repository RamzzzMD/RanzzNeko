import { neko } from "@/lib/nekopoi";
import { normalizeList } from "@/lib/normalize";
import { handleRoute } from "@/lib/apiHandler";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleRoute(async () => {
    const raw = await neko.latest();
    return normalizeList(raw, 1);
  });
}
