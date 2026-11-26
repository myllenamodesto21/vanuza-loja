import { CartaoProduto } from "./cartao-produto";
import type { Produto } from "@/lib/produtos";

export function CarrosselProdutos({ produtos, escuro = false }: { produtos: Produto[]; escuro?: boolean }) {
  return (
    <div className="sem-rolagem -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2">
      {produtos.map((p, i) => (
        <div key={p.id} className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]">
          <CartaoProduto produto={p} indice={i} escuro={escuro} />
        </div>
      ))}
    </div>
  );
}
