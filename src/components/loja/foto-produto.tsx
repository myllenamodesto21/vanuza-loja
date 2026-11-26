import { urlFoto } from "@/lib/produtos";
import { cn } from "@/lib/utils";

// Foto do produto (miniatura nas listas). Sem foto, a logo bem clarinha.
export function FotoProduto({
  caminho,
  nome,
  mini = true,
  prioridade = false,
  className,
}: {
  caminho?: string;
  nome: string;
  mini?: boolean;
  prioridade?: boolean;
  className?: string;
}) {
  const src = urlFoto(caminho, mini);
  if (!src) {
    return (
      <div className={cn("grid place-items-center bg-gradient-to-br from-areia to-linho", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca.webp" alt="" className="w-1/2 opacity-30 mix-blend-multiply" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={nome}
      loading={prioridade ? "eager" : "lazy"}
      fetchPriority={prioridade ? "high" : "auto"}
      decoding="async"
      className={cn("bg-areia object-cover", className)}
    />
  );
}
