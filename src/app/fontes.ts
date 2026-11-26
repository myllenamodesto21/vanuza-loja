import { Bodoni_Moda, Great_Vibes, Jost } from "next/font/google";

// Títulos em Bodoni (serifa de alto contraste, das revistas de moda, como o "VANUZA" da logo),
// corpo limpo e o detalhe manuscrito. O eixo opsz deixa o traço certo em cada tamanho.
export const fonteTitulo = Bodoni_Moda({
  subsets: ["latin"],
  axes: ["opsz"],
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
