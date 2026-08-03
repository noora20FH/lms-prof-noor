"use client";

import { Suspense, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Globe2 } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  compact?: boolean;
  className?: string;
};

function LanguageSwitcherContent({
  compact = false,
  className,
}: LanguageSwitcherProps) {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextLocale: Locale) => {
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.replace(href, {
        locale: nextLocale,
      });
    });
  };

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur-sm",
        "has-[select:focus]:ring-2 has-[select:focus]:ring-white/40",
        compact && "px-2 py-1.5 text-xs",
        className,
      )}
    >
      <Globe2 className={compact ? "h-4 w-4" : "h-5 w-5"} />

      <span className={compact ? "sr-only" : "font-medium"}>
        {t("label")}
      </span>

      <select
        value={locale}
        disabled={isPending}
        aria-label={t("label")}
        onChange={(event) =>
          handleChange(event.target.value as Locale)
        }
        className="cursor-pointer bg-transparent font-semibold outline-none disabled:cursor-wait disabled:opacity-60 [&>option]:bg-white [&>option]:text-gray-900"
      >
        {locales.map((item) => (
          <option key={item} value={item}>
            {localeLabels[item]}
          </option>
        ))}
      </select>
    </label>
  );
}

function LanguageSwitcherFallback({
  compact = false,
  className,
}: LanguageSwitcherProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white/70",
        compact && "px-2 py-1.5 text-xs",
        className,
      )}
    >
      <Globe2 className={compact ? "h-4 w-4" : "h-5 w-5"} />

      {!compact && (
        <span className="font-medium">
          Bahasa
        </span>
      )}

      <span className="font-semibold">
        ...
      </span>
    </div>
  );
}

export default function LanguageSwitcher(
  props: LanguageSwitcherProps,
) {
  return (
    <Suspense
      fallback={
        <LanguageSwitcherFallback {...props} />
      }
    >
      <LanguageSwitcherContent {...props} />
    </Suspense>
  );
}