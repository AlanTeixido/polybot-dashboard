"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AutoRefresh({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
      setLastUpdate(Date.now());
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  const seconds = Math.round((Date.now() - lastUpdate) / 1000);

  return (
    <div className="flex items-center gap-2 text-xs text-white/40">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
      </span>
      <span className="font-mono">
        {seconds < 5 ? "live" : `${seconds}s ago`}
      </span>
    </div>
  );
}
