"use client";

import { useState } from "react";
import { MonitorPlay } from "lucide-react";
import { cn, humanize } from "@/lib/utils";

interface PlayerSource {
  label: string | null;
  url: string | null;
}

/**
 * In-page video player. Direct video files (.mp4/.webm/.ogg) play in a native
 * <video> element; anything else is treated as an embed page and rendered in
 * a sandboxed <iframe> (scripts allowed, popups blocked).
 */
export function StreamPlayer({
  players,
  className,
}: {
  players: PlayerSource[];
  className?: string;
}) {
  const sources = players.filter((p): p is { label: string | null; url: string } =>
    Boolean(p.url)
  );
  const [idx, setIdx] = useState(0);

  if (!sources.length) return null;

  const current = sources[Math.min(idx, sources.length - 1)];
  const isFile = /\.(mp4|webm|ogg)(\?|#|$)/i.test(current.url);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-black", className)}>
      <div className="aspect-video w-full">
        {isFile ? (
          <video
            key={current.url}
            src={current.url}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full bg-black"
          />
        ) : (
          <iframe
            key={current.url}
            src={current.url}
            title="Stream player"
            className="h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            // Scripts must run for embed players; omitting allow-popups
            // keeps ad popups/tab-hijacks blocked.
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          />
        )}
      </div>

      {sources.length > 1 && (
        <div className="flex flex-wrap gap-2 border-t border-border/60 bg-card/80 p-3">
          {sources.map((s, i) => (
            <button
              key={`${s.url}-${i}`}
              onClick={() => setIdx(i)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                i === idx
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/70"
              )}
            >
              <MonitorPlay className="h-3.5 w-3.5" />
              {s.label ? humanize(s.label) : `Stream ${i + 1}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
