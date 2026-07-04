import { defineRouting } from "next-intl/routing";

export const locales = ["id", "en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  id: "Indonesia",
  en: "English",
  zh: "中文",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "id",
  localePrefix: "always",
  localeDetection: true,
  localeCookie: {
    name: "LMS_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  },
});
