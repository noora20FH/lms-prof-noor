"use client";

import { Globe2 } from "lucide-react";

import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  compact?: boolean;
  className?: string;
};

/**
 * Komponen kompatibilitas setelah fitur multi-bahasa dinonaktifkan.
 * LMS menggunakan Bahasa Indonesia secara tetap dan tidak lagi bergantung
 * pada sistem translasi atau konfigurasi locale dinamis.
 */
export default function LanguageSwitcher({
  compact = false,
  className,
}: LanguageSwitcherProps) {
  return (
    <div
      aria-label="Bahasa Indonesia"
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur-sm",
        compact && "px-2 py-1.5 text-xs",
        className,
      )}
    >
      <Globe2 className={compact ? "h-4 w-4" : "h-5 w-5"} />
      {!compact && <span className="font-medium">Bahasa</span>}
      <span className="font-semibold">Indonesia</span>
    </div>
  );
}
