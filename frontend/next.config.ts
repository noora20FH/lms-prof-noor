import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,


  // Aktifkan apabila project menggunakan next/image.
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
