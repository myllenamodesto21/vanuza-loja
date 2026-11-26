const FUSO = "America/Manaus";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarMoeda(valor: number) {
  return moeda.format(valor).replace(/ /g, " ");
}

// Hoje em Manaus, no formato AAAA-MM-DD (o servidor da Vercel roda em UTC).
export function hojeISO(agora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
}

// "2026-12-24" -> "24/12/2026"
export function formatarData(iso: string) {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

// "2026-12-24" -> "24/12"
export function formatarDiaMes(iso: string) {
  const [, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}`;
}

export function somarDias(iso: string, dias: number) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia + dias));
  return data.toISOString().slice(0, 10);
}

export function semAcento(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function lerPreco(texto: string): number | null {
  const limpo = texto.replace(/[^\d,.]/g, "");
  if (!limpo) return null;
  // "1.234,56" ou "89,90" ou "89.90"
  const normal = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  const valor = Number(normal);
  return Number.isFinite(valor) && valor > 0 ? Math.round(valor * 100) / 100 : null;
}

export function precoParaCampo(valor: number | null | undefined) {
  if (valor == null) return "";
  return valor.toFixed(2).replace(".", ",");
}
