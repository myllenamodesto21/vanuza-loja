import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Gestão da loja",
  robots: { index: false, follow: false },
  manifest: "/gestao.webmanifest",
  appleWebApp: { capable: true, title: "Loja Vanuza", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#f7f1ea" };

export default function LayoutGestao({ children }: { children: React.ReactNode }) {
  return children;
}
