import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vanuza Empreendimentos",
    short_name: "Vanuza",
    description: "Catálogo da loja. Peça pelo WhatsApp.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f1ea",
    theme_color: "#f7f1ea",
    lang: "pt-BR",
    icons: [
      { src: "/icone-v4-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icone-v4-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icone-v4-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Promoções", url: "/promocoes" },
      { name: "Gestão da loja", url: "/gestao" },
    ],
  };
}
