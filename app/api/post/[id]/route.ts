import { type NextRequest } from "next/server";
import { neko } from "@/lib/nekopoi";
import { normalizeDetail } from "@/lib/normalize";
import { handleRoute } from "@/lib/apiHandler";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const raw = req.nextUrl.searchParams.get("raw");
  return handleRoute(async () => {
    const payload = await neko.detail(params.id);
    if (raw) return payload;
    return normalizeDetail(payload);
  });
}
