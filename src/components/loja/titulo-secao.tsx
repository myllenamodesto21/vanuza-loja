import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function TituloSecao({ titulo, detalhe, href }: { titulo: string; detalhe?: string; href?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {detalhe && <p className="font-manuscrita text-xl leading-none text-cobre">{detalhe}</p>}
        <h2 className="font-titulo text-[28px] font-medium leading-tight">{titulo}</h2>
      </div>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-1 pb-1.5 text-sm text-cobre-escuro">
          Ver tudo <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
