import { Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";

// Títulos serifados (como o "VANUZA" da logo), corpo limpo e o detalhe manuscrito.
export const fonteTitulo = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--fonte-titulo",
  display: "swap",
});

export const fonteCorpo = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--fonte-corpo",
  display: "swap",
});

export const fonteManuscrita = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--fonte-manuscrita",
  display: "swap",
});
