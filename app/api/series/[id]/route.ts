import { type NextRequest } from "next/server";
import { neko } from "@/lib/nekopoi";
import { normalizeSeries } from "@/lib/normalize";
import { handleRoute } from "@/lib/apiHandler";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleRoute(async () => {
    const raw = await neko.series(params.id);
    return normalizeSeries(raw);
  });
}
