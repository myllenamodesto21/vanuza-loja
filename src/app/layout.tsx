import type { Metadata, Viewport } from "next";

import { fonteCorpo, fonteManuscrita, fonteTitulo } from "./fontes";
import "./globals.css";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vanuza-loja.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "Vanuza Empreendimentos | Moda feminina e masculina",
    template: "%s | Vanuza Empreendimentos",
  },
  description:
    "Catálogo da Vanuza Empreendimentos: moda feminina, masculina e infantil, perfumaria, calçados e bolsas. Peça pelo WhatsApp. Honório Roldão, Presidente Figueiredo (AM).",
  icons: { icon: "/favicon.png?v=4", apple: "/apple-icon-v4.png" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Vanuza Empreendimentos",
    images: [{ url: "/compartilhar.jpg", width: 1200, height: 630 }],
  },
  appleWebApp: { capable: true, title: "Vanuza", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f7f1ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${fonteTitulo.variable} ${fonteCorpo.variable} ${fonteManuscrita.variable}`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
