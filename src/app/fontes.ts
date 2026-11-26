import { Great_Vibes, Jost, Outfit } from "next/font/google";

// Títulos em Outfit (sem serifa, moderna e confortável de ler; a serifa fica só na logo),
// corpo em Jost e o detalhe manuscrito em Great Vibes.
export const fonteTitulo = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
