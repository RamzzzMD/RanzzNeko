import "server-only";
import { NextResponse } from "next/server";
import { NekoError } from "@/lib/nekopoi";

/** Wrap an async route handler with consistent error → JSON conversion. */
export async function handleRoute<T>(
  fn: () => Promise<T>
): Promise<NextResponse> {
  try {
    const data = await fn();
    return NextResponse.json(data, {
      headers: {
        // Cache at the edge for a short window to reduce upstream calls.
        "Cache-Control":
          "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (e) {
    if (e instanceof NekoError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
