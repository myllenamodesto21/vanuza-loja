import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async headers() {
    return [
      {
        // Área da gestão: fora dos buscadores e sem guardar em cache.
        source: "/gestao/:caminho*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
